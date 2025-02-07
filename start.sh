#!/bin/bash
# Start both APIs in parallel
python book_api.py & python video_api.py & wait