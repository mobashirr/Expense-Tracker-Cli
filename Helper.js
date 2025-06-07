


// helper function


// Arguments parser
const ParseNamedArguments = () => {

    // parse arguments in form expence-cli --description somthing --amount 400
    const NamedArgs = process.argv.slice(3);
    let args = {};

    for(let i = 0; i < NamedArgs.length; i += 2){
        const key = NamedArgs[i].replace("--", "");
        const value = NamedArgs[i + 1];

        // (edge case last element not complete)
        if(key && value)
            args[key] = value;
    }

    return args;
}

const GetMonthStringFromExpenceObject = (ExpenceObject) => {
    let ExpenceDate = ExpenceObject.date.split(' ');
    return ExpenceDate[1]
}

const GetCurrentMonthStringFromDateObject = (DateObject) => {

  const DateString = DateObject.toDateString();
  const CurrentMonthFUllString = DateString.split(' ')[1];
  
  return GetMonthString(GetMonthIndex(CurrentMonthFUllString))
  
}

const GetMonthString = (MonthIndex) => {
    const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];


    if(MonthIndex > 12)
        return "Invalid Month";
    else
        return months[MonthIndex - 1]

}

const GetMonthIndex = (MonthFullString) => {
    const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  // months.findIndex(MonthString => MonthString === MonthFullString)
  return 0
}

const CheckMonthMached = (MonthIndex, MonthString) => {
    const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];


    if(MonthIndex > 12)
        return false;

    if (months[MonthIndex - 1] === MonthString)
        return true
    
    return false;
}

const ReadUserBooleanInput = () => {
  return new Promise((resolve) => {
    console.log("Do you agree? (yes/no):");

    process.stdin.setEncoding("utf8");

    process.stdin.once("data", (data) => {
      const input = data.trim().toLowerCase();
      const isTrue = input === "yes" || input === "y" || input === "true";

      process.stdin.pause();
      resolve(isTrue);
    });
  });
};


export{
    ParseNamedArguments,
    GetCurrentMonthStringFromDateObject,
    GetMonthStringFromExpenceObject,
    GetMonthString,
    CheckMonthMached,
    ReadUserBooleanInput
}