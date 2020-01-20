const calBedarf=(height, weight, sex, activity, age)=>{
    if(sex=="m")
        return (66.47+(13.7*weight)+(5*height)-(6.8*age))*(activity)
     else if (sex=="w")
        return (655.1+(9.6*weight)+(1.8*height)-(4.7*age))*(activity)
    else 
        return 0 
}
const proBedarf=(weight, age)=>{
    if(age<65)
        return weight*0.8
    else 
        return weight
}

const fatBedarf=(height, weight, sex, activity, age)=>{
    return calBedarf(height, weight, sex, activity,age)*0.3/9.3
} 

const maxSatFat=(height, weight, sex, activity, age)=>{
    return fatBedarf(height, weight, sex, activity, age)*0.1
}

const carbBedarf=(height, weight, sex, activity, age)=>{
    return (calBedarf(height, weight, sex, activity, age)-(fatBedarf(height, weight, sex, activity, age)*9.3)-(proBedarf(weight,age)*4.1))/4.1
}

const maxSugar=(height, weight, sex, activity, age)=>{
    return carbBedarf(height, weight, sex, activity, age)*0.1
}
module.exports={
    calBedarf,
    proBedarf,
    fatBedarf,
    maxSatFat,
    carbBedarf,
    maxSugar
}