#!/bin/bash
#
# Prerequisites:
# Python3, node (stable, 10.X), expect, awscli with 'aws configure' run and able to connect


# Get the dates for today and a week ago in the right format
#
starttime=`date -d"last week" +%FT00:00:00.000Z`
endtime=`date +%FT00:00:00.000Z`

# create the times.json file to get the data for the last week
#
tee "times.json" > /dev/null <<EOF
{
  "mytimes": [
    { "start": "$starttime", "end": "$endtime" }
  ]
}
EOF

# get all the instances in the default regios set in aws configure
# temporarily store them in the _instances.json
#
aws ec2 describe-instances > _instances.json
instances=( `jq -r '.Reservations | .[] | .Instances | .[] | .InstanceId' _instances.json` )
#echo ${instances[@]}

# create the instances.json file
#
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

# create the metrics.json file as a copy of the defaults
# ToDo: pull the available metrics dynamically
#
cp example.metrics.json metrics.json

# get the data from aws cloudwatch
#
python3 get_data.py

# create the graphs folder, or empty it out
#
if [ ! -d "graphs" ];
then
  mkdir graphs
else
  rm -rf graphs/*
fi

# generate the svgs based on the csv's
node runner.js

# create the images folder, or empty it out
#
if [ ! -d "images" ];
then
  mkdir images
else
  rm -rf images/*
fi

# create the dated folder within the images folder
#
for graphdates in `ls graphs`
do
  if [ ! -d "images/$graphdates" ];
  then
    mkdir "images/$graphdates"
  fi
done;

# perform the conversion from svg's to png's
#
for graphs in `find graphs -name "*.svg" | sed "s/^graphs//g" | sed "s/svg$//g"`;
do
  convert -background none -size 1024x1024 "graphs${graphs}svg" "images${graphs}png"
done

# create the tarballs folder, or empty it out
#
if [ ! -d "tarballs" ];
then
  mkdir tarballs
else
  rm -rf tarballs/*
fi

# create the tarball of the png files and email them off the server
#
for imagedates in `ls images`
do
  tar cvzf tarballs/${imagedates}.tgz images/$imagedates
  echo "This weeks graphs from AWS" | mail -s "Cloudwatch Graphs" user@example.com -A tarballs/${imagedates}.tgz
done
