    var suggestionsPanel = document.querySelector('.suggestions');
    document.getElementById("autoComplete").addEventListener('input',function(e){
        var val = this.value;
        suggestionsPanel.innerHTML = '';
        if(!val)
            return false;
        curFocus = -1;
        let result = []
        if(e.target.value)
        {
            result = res.filter(movie => movie.toLowerCase().includes(e.target.value.toLowerCase()));
        }
        var x = 5;
        if(result.length<5)
            x = result.length;
        var short = result.slice(0,x);
        short.forEach(function(mov){
            const div = document.createElement("div");
            div.innerHTML = mov;
            div.innerHTML+= "<br>";
            div.innerHTML+="<input type='hidden' value='"+mov+"'>";
            //console.log(div.getElementsByTagName("input"));
            div.addEventListener('click',function(e){
                document.getElementById("autoComplete").value = div.getElementsByTagName("input")[0].value;
                suggestionsPanel.innerHTML = '';
            })
            suggestionsPanel.appendChild(div);
        })
    })