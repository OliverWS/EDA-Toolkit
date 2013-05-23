DATE=$(shell date +%I:%M%p)
CHECK=\033[32m✔\033[39m
HR=\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#
OUTPUT_FILE=cbsl.min.js

EXTERNAL_DEPENDENCIES = 

load_remote:
	

#
# BUILD
#

build:load_remote
	@echo "\n${HR}"
	@echo "Building Composite JS File..."
	@echo "${HR}\n"
	@cat numjs.js eda_toolkit.js dropzone.js edadroplet.js videodroplet.js > ${OUTPUT_FILE}
	@echo "\n${HR}"
	@echo "CBSL JS successfully built at ${DATE}."

#
# CLEANS THE ROOT DIRECTORY OF PRIOR BUILDS
#

clean:
	rm ${OUTPUT_FILE};

