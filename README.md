# cloudgraph
A utility to pull the cloudwatch data from AWS and graph it.
Usage:  
git clone https://github.com/sidharrell/cloudgraph.git  
cd cloudgraph  
./cloudgraph.sh  
# dependancies
TBD
# local changes
you'll need to specify the email address to replace user@example.com in cloudgraph.sh
if you try to pull after that, and there are updates, you'll get an error in git
"error: Your local changes to the following files would be overwritten by merge:"
<pre>git stash
git pull
git stash pop</pre>