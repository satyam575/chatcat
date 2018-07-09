module.exports = function(express,app,passport,config,rooms){
    var router = express.Router();

    router.get('/',function(req,res,next){
        res.render('index',{title: 'welcome to chatcat'});
    })

    function securePages(req,res,next){
        if(req.isAuthenticated){
            next();
        }else{
            res.redirect('/');
        }
    }
    router.get('/chatrooms',securePages,function(req,res,next){
        res.render('chatrooms',{title:'chatrooms',user:req.user,config:config});
    })

    function findTitle(room_id){
        var n = 0 ;
        while(n < rooms.length){
            if(rooms[n].room_number == room_id){
                return rooms[n].room_name;
                break;
            }else{
                n++ ;
                continue;
            }
        }
    }
    router.get('/room/:id',securePages,function(req,res,next){
        var room_name = findTitle(req.params.id);
        res.render('room',{room_name:room_name,room_number:req.params.id,user:req.user,config:config})
    })

    router.get('/logout',function(req,res,next){
        req.logout();
        res.redirect('/');
    })
    router.get('/auth/facebook',passport.authenticate('facebook'));
    router.get('/auth/facebook/callback',passport.authenticate('facebook',{
        successRedirect:'/chatrooms',
        failureRedirect:'/'
    }));
  
    app.use('/',router);
}