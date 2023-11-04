from sklearn.cluster import DBSCAN
from math import radians, degrees, sin, cos, asin, acos, sqrt
import requests
import json
import argparse

trips =[]
parser = argparse.ArgumentParser(description='Parse JSON input from the command line.')
parser.add_argument('trip_input', type=str, help='JSON input as a string')
args = parser.parse_args()

try:
    trips = json.loads(args.trip_input)
except json.JSONDecodeError:
    print("Error: Invalid JSON input.")


# Function to cluster trips based on source coordinates
def cluster_trips(trips, max_distance_for_source_cluster):
    source_coords = [(trip['source']['lat'], trip['source']['lng']) for trip in trips]
    dbscan = DBSCAN(eps=max_distance_for_source_cluster, min_samples=1, metric=calculate_distance_with_google_maps)
    trip_labels = dbscan.fit_predict(source_coords)
    return trip_labels


def calculate_distance_with_google_maps(source_coords, destination_coords):
    api_key = "AIzaSyDqGekBgqLxzSbyX6t9TYP18lHLCB72m3Q"
    source = f'{source_coords[0]}'+',' f'{source_coords[1]}'
    destination = f'{destination_coords[0]}' +','+ f'{destination_coords[1]}'
    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={source}&destination={destination}&key={api_key}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if "routes" in data and data["routes"]:
            route = data["routes"][0]
            distance = 0
            for leg in route["legs"]:
                distance += leg["distance"]["value"]
            return distance / 1000  # Convert meters to kilometers
        else:
            return None
    else:
        print("Error: Unable to retrieve data from Google Maps API.")
        return None

def cluster_trips_by_destination(trips, source_clusters, max_distance_for_destination):
    clusters = {}

    for i, trip in enumerate(trips):
        source_cluster_label = source_clusters[i]
        if source_cluster_label not in clusters:
            clusters[source_cluster_label] = []

        clusters[source_cluster_label].append(trip)

    destination_labels = {}

    for source_cluster_label, cluster_trips in clusters.items():
        destination_coords = [(trip['destination']['lat'], trip['destination']['lng']) for trip in cluster_trips]
        dbscan = DBSCAN(eps=max_distance_for_destination, min_samples=1, metric=calculate_distance_with_google_maps)
        destination_labels[source_cluster_label] = dbscan.fit_predict(destination_coords)

    return destination_labels,clusters

#test
def select_trips_in_clusters(trips, max_capacity, max_distance, max_distance_for_source_cluster, max_distance_for_destination):
    source_clusters = cluster_trips(trips, max_distance_for_source_cluster)
    destination_labels,clusters = cluster_trips_by_destination(trips, source_clusters, max_distance_for_destination)
    trip_map={}
    for s_cluster,d_labelsList in destination_labels.items():
      for i,label in enumerate(d_labelsList):
        tmp = str(s_cluster) + '_' + str(label)
        if tmp not in trip_map:
          trip_map[tmp]=[]
        trip_map[tmp].append(clusters[s_cluster][i])
    return trip_map


api_key = "AIzaSyDqGekBgqLxzSbyX6t9TYP18lHLCB72m3Q"

max_capacity = 1500  # Maximum capacity of the truck
max_distance = 1500  # Maximum allowed distance in kilometers
max_distance_for_source_cluster = 300  # Maximum distance for source clustering
max_distance_for_destination = 300



selected_trips = select_trips_in_clusters(trips, max_capacity, max_distance, max_distance_for_source_cluster, max_distance_for_destination)


all_trips=[]
for group in selected_trips.values():
    group.sort(key=lambda x: x['weight'], reverse=True)

# Initialize a list to store assigned trips for each vehicle
assigned_trips = []

# Iterate through the groups and assign trips to vehicles
for group in selected_trips.values():
    for trip in group:
        assigned = False
        # Try to assign the trip to an existing vehicle
        for vehicle in assigned_trips:
            if vehicle['weight'] >= trip['weight']:
                vehicle['trips'].append(trip)
                vehicle['weight'] -= trip['weight']
                assigned = True
                break
        # If no existing vehicle can accommodate the trip, assign it to a new vehicle
        if not assigned:
            new_vehicle = {'trips': [trip], 'weight': 1500 - trip['weight']}
            assigned_trips.append(new_vehicle)

for idx, vehicle in enumerate(assigned_trips):
    all_trips.append(vehicle['trips'])
print(all_trips)




