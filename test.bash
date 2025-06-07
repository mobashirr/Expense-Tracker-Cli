#!/usr/bin/env bash

echo ".........."
node index.js list

echo ".........."
echo "\t add command"
node index.js add description
node index.js add description hello amount
node index.js add description hello amount 4
node index.js add description hello2 amount 44
node index.js add description hello3 amount 444

echo ".........."
echo "\t update command"
node index.js update id
node index.js update id 1  newdescription
node index.js update id 1  newdescription "HelloFromUpdate"
node index.js update id 1  newamount 
node index.js update id 1  newamount 55
node index.js update id 1  newdescription "NewDescrip" newamout 66


echo ".........."
echo "\t delete command"
node index.js delete id
# node index.js delete id 1
node index.js delete id 100000

echo ".........."
echo "\t list command"
node index.js list

echo ".........."
echo "\t summary command"
node index.js summary
node index.js summary month 
node index.js summary month 6
node index.js summary month 44

