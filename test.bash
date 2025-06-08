#!/usr/bin/env bash

echo ".........."
Expence-Cli list

echo ".........."
echo "\t add command"
Expence-Cli add description
Expence-Cli add description hello amount
Expence-Cli add description hello amount 4
Expence-Cli add description hello2 amount 44
Expence-Cli add description hello3 amount 444

echo ".........."
echo "\t update command"
Expence-Cli update id
Expence-Cli update id 1  newdescription
Expence-Cli update id 1  newdescription "HelloFromUpdate"
Expence-Cli update id 1  newamount 
Expence-Cli update id 1  newamount 55
Expence-Cli update id 1  newdescription "NewDescrip" newamout 66


echo ".........."
echo "\t delete command"
Expence-Cli delete id
# Expence-Cli delete id 1
Expence-Cli delete id 100000

echo ".........."
echo "\t list command"
Expence-Cli list

echo ".........."
echo "\t summary command"
Expence-Cli summary
Expence-Cli summary month 
Expence-Cli summary month 6
Expence-Cli summary month 44

