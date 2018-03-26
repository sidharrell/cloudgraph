import datetime
from dateutil.tz import tzlocal
from pprint import pprint
import boto3
import json

f=open('file1', 'w')
f.write("Date,CPUutilization\n")
client = boto3.client('cloudwatch')
pprint(client)
responses = client.get_metric_statistics(
  Namespace='AWS/EC2',
  MetricName='CPUUtilization',
  Dimensions=[
    {
      'Name': 'InstanceId',
      'Value': 'i-00ae655e6fa21a06f'
    },
  ],
  StartTime='2018-03-01T00:00:00.607Z',
  EndTime='2018-04-01T00:00:00.607Z',
  Period=3600,
  Statistics=['Average']
)
pprint(responses['Datapoints'])
datapoints=responses['Datapoints']
def getKey(custom):
  return custom['Timestamp'].timestamp()
datapoints.sort(key=getKey)
for data in datapoints:
  f.write("%s,%s\n" % (data['Timestamp'].timestamp(),data['Average']))

#print(responses)
