#!/bin/bash
starttime=`date -d"last week" +%FT00:00:00.000Z`
endtime=`date +%FT00:00:00.000Z`

tee "times.json" > /dev/null <<EOF
Some text that contains my $var
{
  "mytimes": [
    { "start": "$starttime", "end": "$endtime" }
  ]
}
EOF
