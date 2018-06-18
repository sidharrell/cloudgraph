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
#echo ${instances[@]}

tee 'instances.json' > /dev/null <<EOF
{
  "myinstances": [
EOF
last=$(expr "${#instances[@]}" - 1)
#echo $last
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
if [ ! -d "graphs" ];
then
  mkdir graphs
fi
node runner.js
if [ ! -d "images" ];
then
  mkdir images
fi
for graphdates in `ls graphs`
do
  if [ ! -d "images/$graphdates" ];
  then
    mkdir "images/$graphdates"
  fi
done;
for graphs in `find graphs -name "*.svg" | sed "s/^graphs//g" | sed "s/svg$//g"`;
do
  convert -background none -size 1024x1024 "graphs${graphs}svg" "images${graphs}png"
done
if [ ! -d "tarballs" ];
then
  mkdir tarballs
fi
for imagedates in `ls images`
do
  tar cvzf tarballs/${imagedates}.tgz images/$imagedates
  echo "This weeks graphs from AWS" | mail -s "Cloudwatch Graphs" user@example.com -A tarballs/${imagedates}.tgz
done
