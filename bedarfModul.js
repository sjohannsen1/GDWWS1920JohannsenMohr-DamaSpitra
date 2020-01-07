const calBedarf=(height, weight, sex, activity, age)=>{
    if(sex=="m")
        return 66.47+(13.7*weight)+(5*height)-(6.8*age)*(activity)
     else
        return 65.51+(9.6*weight)+(1.8*height)-(4.7*age)*(activity)
}
const proBedarf=(weight, age)=>{
    if(age<65)
        return weight*0.8
    else 
        return weight
}

const fatBedarf=(calReq)=>{
    return calReq*0.3
} 

const maxSatFat=(fatReq)=>{
    return fatReq*0.1
}

const carbBedarf=(calReq, fatReq, proReq)=>{
    return (calReq-(fatReq*9.3)-(proReq*4.1))/4.1
}

const maxSugar=(carbReq)=>{
    return carbReq*0.1
}
module.exports={
    calBedarf,
    proBedarf,
    fatBedarf,
    maxSatFat,
    carbBedarf,
    maxSugar
}