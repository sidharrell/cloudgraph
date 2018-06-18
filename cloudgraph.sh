#!/bin/bash
starttime=`date -d"last week" +%FT00:00:00.000Z`
endtime=`date +%FT00:00:00.000Z`

tee "times.json" > /dev/null <<EOF
{
  "mytimes": [
    { "start": "$starttime", "end": "$endtime" }
  ]
}
EOF

aws ec2 describe-instances > _instances.json
instances=( `jq -r '.Reservations | .[] | .Instances | .[] | .InstanceId' _instances.json` )
echo ${instances[@]}

tee 'instances.json' > /dev/null <<EOF
{
  "myinstances": [
EOF
last=$(expr "${#instances[@]}" - 1)
echo $last
for ((i=0; i < "${#instances[@]}"; i++))
do
  if [ $i -eq "$last" ]; then
    echo "    { \"id\": \"${instances[$i]}\", \"name\": \"$i\" }" >> instances.json
  else
    echo "    { \"id\": \"${instances[$i]}\", \"name\": \"$i\" }," >> instances.json
  fi
done

tee -a "instances.json" > /dev/null <<EOF
  ]
}
EOF

cp example.metrics.json metrics.json
python3 get_data.py
mkdir graphs
node runner.js
