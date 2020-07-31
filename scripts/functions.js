function numberDivider(number,separator=' '){//    (125000) => "125'000"
    number = `${number}`
    let dividers = Math.floor(number.length/3);

    number = number.split('').reverse();
    for(let i=1;i<number.length;i++){

        if (i%3==0) number[i]+= `${separator}`;

    }
    number = number.reverse().join('')
    return number
}

let statusTranslate = status =>{
    switch(status){
        case 'old':
        return 'Б/У';
        case 'new':
        return 'Новый'
    }
}