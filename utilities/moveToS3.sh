#!/bin/bash

# Configuration
UPLOADS_DIR="voiceRecorder-standalone/server/uploads"
S3_BUCKET="s3://hrv-audio-recs"
LOG_FILE="voiceRecorder-standalone/utilities/moveToS3.log"

# Start logging
echo "Starting file transfer at $(date)" >> $LOG_FILE

# Loop through files in the directory
for file in $UPLOADS_DIR/*
do
    if [ -f "$file" ]; then  # Ensure it's a file, not a directory
        echo "Uploading $file to $S3_BUCKET" >> $LOG_FILE
        
        # Upload to S3 and check if the upload was successful
        if aws s3 cp "$file" "$S3_BUCKET"; then
            echo "Successfully uploaded $file" >> $LOG_FILE
            
            # Remove the file if upload was successful
            rm "$file"
            echo "Deleted local file $file" >> $LOG_FILE
        else
            echo "Failed to upload $file" >> $LOG_FILE
        fi
    fi
done

echo "File transfer completed at $(date)" >> $LOG_FILE
