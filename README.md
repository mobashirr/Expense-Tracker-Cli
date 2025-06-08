# Expense-Tracker-Cli

this is a simple cli tool made for tracking your expences, i the motivation behind this tool is a challenge i found in roadmap.sh website which you can see at this url:
```
https://roadmap.sh/projects/expense-tracker
```

## features
1. Users can add an expense with a description and amount.
2. Users can update an expense.
3. Users can delete an expense.
4. Users can view all expenses.
5. Users can view a summary of all expenses.
6. Users can view a summary of expenses for a specific month (of current year).
7. Allow users to set a budget for each month and show a warning when the user exceeds the budget
8. Store Expences in CSV file


## example usage
```
$ expence-cli add --description "Lunch" --amount 20
# Expense added successfully (ID: 1)

$ expence-cli add --description "Dinner" --amount 10
# Expense added successfully (ID: 2)

$ expence-cli list
# ID  Date       Description  Amount
# 1   2024-08-06  Lunch        $20
# 2   2024-08-06  Dinner       $10

$ expence-cli summary
# Total expenses: $30

$ expence-cli delete --id 2
# Expense deleted successfully

$ expence-cli summary
# Total expenses: $20

$ expence-cli summary --month 8
# Total expenses for August: $20
```