import datetime
from dateutil.tz import tzlocal
from pprint import pprint
import boto3
import json
import os

with open('instances.json') as json_data:
  d = json.load(json_data)
with open('times.json') as json_data:
  t = json.load(json_data)
with open('metrics.json') as json_data:
  m = json.load(json_data)
if not os.path.exists("output"):
  os.makedirs("output")
for instance in d['myinstances']:
  for time in t['mytimes']:
    if not os.path.exists('output/'+time['start']):
      os.makedirs('output/'+time['start'])
    for metric in m['mymetrics']:
      f = open('output/'+time['start']+'/'+instance['id']+'-'+metric['metricName'], 'w')
      f.write("Date,"+metric['title']+"\n")
      client = boto3.client('cloudwatch')
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
      pprint(responses['Datapoints'])
      mylist=[]
      datapoints=responses['Datapoints']
      def getKey(custom):
        return custom['Timestamp'].timestamp()
      datapoints.sort(key=getKey)
      for data in datapoints:
        f.write("%s,%s\n" % (data['Timestamp'].timestamp(),data[metric['statisticValues']]))
