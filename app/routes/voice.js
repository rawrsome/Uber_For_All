var twilio = require('twilio');
var mongoose = require('mongoose');
mongoose.set('debug', true);

module.exports = function(){
    function Welcome(){
        this.name = "Welcome";
        this.speak = function(twimlResponse){
            twimlResponse.say("Welcome to Uber for all , please select any one of the options");
            twimlResponse.pause(2);
            twimlResponse.gather({timeout: 20, finishOnKey: '#', numOfDigits: 4}, function(response){
                twimlResponse.say("To continue using this service please enter you Pin followed by a pound sign");
            });
        }
    }

    function EnterPin(){
        var User = mongoose.model('User');
        var result = false;
        this.name = "EnterPin";
        User.find({ phone: '4087017051', pin: '1234'}, function(err, user){
            if(err){
                console.log(err);
                this.validPin  = false ;
            }else{
                this.validPin  = true ;
            }
        });

        this.speak = function(twimlResponse, pin){
            twimlResponse.gather({timeout: 20, finishOnKey: '#', numOfDigits: 1}, function(){
                    if(!(validPin)){
                        twimlResponse.say("The entered credentials are not valid");//this workd
                        twimlResponse.say("please try again, Bye");
                        this.next = this.reset;
                    }else{
                        twimlResponse.say("Your pin was validated as " + pin);
                        twimlResponse.pause(1);
                        twimlResponse.say("Do you want to reserve a ride");
                        twimlResponse.say("Press 1 for yes and 0 for No");
                    }
            });
        };
    }

    function EnterPickUpLocation(){
        this.name = "EnterPickUpLocation";
        this.speak = function(twimlResponse, answer){
            if(answer === '1'){
                twimlResponse.gather({timeout: 20, finishOnKey: '#', numOfDigits: 1}, function(){
                    twimlResponse.say("Do you want to be picked up from Home");
                    twimlResponse.pause(1);
                    twimlResponse.say("Press 1 for home and Press 2 for other locations");
                });
            }else{
                twimlResponse.say("You Entered an invalid Input -pickup location");//this workd
                twimlResponse.say("please try again, Bye");
                this.next = this.reset;
                //return new Welcome();
            }
        }
    }

    function ReserveRide(){
        this.name = "ReserveRide";
        this.speak = function(twimlResponse, isHome){
            if(isHome === '1'){
                twimlResponse.say("Your ride has been despatched to your home location ");
                twimlResponse.say("Thank you for using the service , Have a great day");
            }else{
                //this needs 
                twimlResponse.say("You Entered an invalid Input- reserve ride"); // this works and does not work when you type 3 above
                twimlResponse.say("please try again, Bye");
                this.next = this.reset;
            }
        } 
    }

    var welcome = new Welcome();
    var enterPin = new EnterPin();
    var enterPickUpLocation = new EnterPickUpLocation();
    var reserveRide = new ReserveRide();
    welcome.next = enterPin;
    enterPin.next = enterPickUpLocation;
    enterPickUpLocation.next = reserveRide;
    reserveRide.next = welcome;
    enterPickUpLocation.reset = welcome;
    enterPin.reset = welcome;
    reserveRide.reset = welcome;
    return welcome ;
}();
