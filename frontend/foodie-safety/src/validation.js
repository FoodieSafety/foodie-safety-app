document.querySelector('form').addEventListener('submit', function (event) {
    const emailInput = document.getElementById('email');
    const emailValue = emailInput.value.trim(); 

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailValue)) {
        alert('Please enter a valid email address');
        event.preventDefault(); 
    }
});

document.getElementById('zipcode').addEventListener('input', function() {
    const zipCode = this.value
    
    if(zipCode.length === 5) {
        fetch(`https://api.zippopotam.us/us/${zipCode}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Invalid ZIP code');
                }
                return response.json();
            })
            .then(data => {
                console.log(data)
                const state = data.places[0]['state'];
                document.getElementById('state').value = state; 
            })
            .catch(error => {
                console.error('Error fetching state data:', error);
            });
        
    } 
})


