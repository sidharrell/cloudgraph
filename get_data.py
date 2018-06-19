# Prerequisites:
# Python3, datetime, pprint(if debugging), boto3

import datetime
from dateutil.tz import tzlocal
#from pprint import pprint
import boto3
import json
import os


# read in the data
#
with open('instances.json') as json_data:
  d = json.load(json_data)
with open('times.json') as json_data:
  t = json.load(json_data)
with open('metrics.json') as json_data:
  m = json.load(json_data)

# create the directory to output the csv files to
#
if not os.path.exists("output"):
  os.makedirs("output")

# loop over the instances
for instance in d['myinstances']:
  # loop over the times
  for time in t['mytimes']:
    # create the timestamped folder
    if not os.path.exists('output/'+time['start']):
      os.makedirs('output/'+time['start'])
    # loop over the metrics
    for metric in m['mymetrics']:
      # open up the metadata file for output
      meta = open('output/'+time['start']+'/'+instance['id']+'-'+metric['metricName']+'.meta', 'w')
      # open the csv file for output
      f = open('output/'+time['start']+'/'+instance['id']+'-'+metric['metricName'], 'w')
      # write the headers line in the csv file
      f.write("Date,"+metric['title']+"\n")
      # get a handle on the aws api
      client = boto3.client('cloudwatch')
      # send the api request
      responses = client.get_metric_statistics(
        Namespace='AWS/EC2',
        MetricName=metric['metricName'],
        Dimensions=[
          {
            'Name': 'InstanceId',
            'Value': instance['id']
          },
        ],
        StartTime=time['start'],
        EndTime=time['end'],
        Period=3600,
        Statistics=[metric['statisticValues']]
      )
      #pprint(responses['Datapoints'])
      # create array to put the parsed data into
      mylist=[]
      # pull the data from the response
      datapoints=responses['Datapoints']
      # function to parse the date info
      def getKey(custom):
        return custom['Timestamp'].timestamp()
      # the data comes back from aws not in chronological order, process it into chrono order here
      datapoints.sort(key=getKey)
      # write the metadata to the metadata file
      json.dump(metric, meta)
      # write the data to the data file
      for data in datapoints:
        f.write("%s,%s\n" % (data['Timestamp'].timestamp(),data[metric['statisticValues']]))
