function tabSwitch(new_tab, new_content) {
     
    document.getElementById('content_1').style.display = 'none';
    document.getElementById('content_2').style.display = 'none';
    document.getElementById('content_3').style.display = 'none';  
    document.getElementById('content_4').style.display = 'none'; 
    document.getElementById('content_5').style.display = 'none';        
    document.getElementById('content_6').style.display = 'none';   
    document.getElementById('content_7').style.display = 'none';   
    document.getElementById('content_8').style.display = 'none';   
    document.getElementById('content_9').style.display = 'none';   

    document.getElementById(new_content).style.display = 'block';   
     
 
    document.getElementById('tab_1').className = '';
    document.getElementById('tab_2').className = '';
    document.getElementById('tab_3').className = ''; 
    document.getElementById('tab_4').className = '';   
    document.getElementById('tab_5').className = '';
    document.getElementById('tab_6').className = '';  
    document.getElementById('tab_7').className = '';  
    document.getElementById('tab_8').className = '';  
    document.getElementById('tab_9').className = '';  
    document.getElementById(new_tab).className = 'active';      
 
}


