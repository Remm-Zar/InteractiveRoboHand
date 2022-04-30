"use strict";
class Finger
{
    constructor(x,y,z,alpha,beta,gamma,width,lenth1,lenth2,lenth3)
    {
        this.gui=
        {
            двигать_пальцем:0,   
        }
        //ОРИЕНТАЦИЯ ПАЛЬЦА 
        this.orientation=
        {
            x:x,
            y:y,
            z:z,
            alpha:alpha,
            beta:beta,
            gamma:gamma,
        }
        //ГАБАРИТЫ ПАЛЬЦА
        this.size=
        {
           width: width,
           lenth1:lenth1,
           lenth2:lenth2,
           lenth3:lenth3,
            
        }
        //ОБЩИЙ СДВИГ ПАЛЬЦА
        this.offset=
        {
            changed:false,
            value:0,
        }
        //СДВИГ КАЖДОЙ ФАЛАНГИ
        this.offsets = 
        {
            down_plx:0,
            mid_plx: 0,
            top_plx:0,
        };
        //СОСТОЯНИЯ ПАЛЬЦА
        this.controls={
            //КОНЕЧНЫЕ СОСТОЯНИЯ 
            default:true,//ВЫТЯНУТ
            flexed:false,//СОГНУТ
            semi_state:false, ///ПРОМЕЖУТОЧНОЕ СОСТОЯНИЕ   
            //ПРОЦЕССЫ
            flexing:false,//СГИБАНИЕ 
            unflexing:false,//РАЗГИБАНИЕ
            
        };
        //ПАРАМЕТРЫ ПАЛЬЦА(НЕЧ. ФАЛАНГИ,ЧЕТ. СУСТАВЫ)
        this.phl_arr=[this.size.lenth1/2,0,this.size.lenth2/2,this.size.lenth1/2,this.size.lenth2/2,this.size.lenth3/2];

        this.fingerGeometry=Array();
        this.fingerGeometry[0]=new THREE.BoxGeometry(this.size.lenth1,this.size.width,this.size.width);
        this.fingerGeometry[1]=new THREE.BoxGeometry(this.size.lenth2,this.size.width,this.size.width);
        this.fingerGeometry[2]=new THREE.BoxGeometry(this.size.lenth3,this.size.width,this.size.width);
        //ФАЛАНГИ
        this.phl=Array();
        for (let i=0;i<3;++i)
        {
            var mat=new THREE.MeshLambertMaterial({color: 'grey'});
            var phalanx=new THREE.Mesh(this.fingerGeometry[i],mat);
            phalanx.position.x=this.phl_arr[i*2];
            phalanx.position.y=0;
            phalanx.position.z=0;
            phalanx.castShadow=true;
            this.phl.push(phalanx);
        }

        //СУСТАВЫ
        this.pivots=Array();
        for (let i=0;i<3;++i)
        {
            var pivot=new THREE.Object3D();
            if (i==0)
            {
                pivot.position.x=x;
                pivot.position.x=y;
                pivot.position.z=z;
                pivot.rotation.set(alpha,beta,gamma);
            }
            else
            {
                pivot.position.x=this.phl_arr[i*2+1];
                pivot.position.y=0; 
                pivot.position.z=0;
                pivot.rotation.set(0,0,0);
            }
            this.pivots.push(pivot);  
        }
        //СБОРКА ПАЛЬЦА
            this.pivots[2].add(this.phl[2]);
            this.phl[1].add(this.pivots[2]);
            this.pivots[1].add(this.phl[1]);
            this.phl[0].add(this.pivots[1]);
            this.pivots[0].add(this.phl[0]);
    
         
    }
    show(scene)
    {
         scene.add(this.pivots[0]);
    }
    position(x,y,z)
    {
        this.orientation.x=x;
        this.orientation.y=y;
        this.orientation.z=z;
        this.pivots[0].position.set(x,y,z);
    }
    rotation(alpha,beta,gamma)
    {
        this.orientation.alpha=alpha;
        this.orientation.beta=beta;
        this.orientation.gamma=gamma;
        this.pivots[0].rotation.set(alpha,beta,gamma);
    }
    moving()//сжать/разжать палец
    {
       // console.log("in flexing firstly",this);
        if (this.offset.value<=-Math.PI/2)
        {
            this.set_flexed();
           console.log(" in flexed",this);
            this.offset.changed=false;
        }
        else if(this.offset.value>=0)
        {
            this.reset();
            console.log("in reset",this);
            this.offset.changed=false;
        }
        else
        {
            this.controls.flexed=false;
            this.controls.default=false;
            this.controls.semi_state=true;
            if (this.controls.flexing||this.controls.unflexing)
            {
                this.offset.value+=(this.controls.flexing*(-1)+!this.controls.flexing)*0.07;
                this.offset.changed=true;  
            }
            else
            {
                this.offset.changed=false;
            }
            
            this.update();
            console.log("in move",this);
            
        }     
        
        //console.log(this);
    }
    
    set_flexed()
    {
        this.controls.default=false;
        this.controls.flexed=true;
        this.controls.semi_state=false;
        this.controls.flexing=false;
        this.controls.unflexing=false;
        
        this.offset.value=-Math.PI/2;
        
        this.update();
        
    }
    reset()
    {
        this.controls.default=true;
        this.controls.flexed=false;
        this.controls.semi_state=false;
        this.controls.flexing=false;
        this.controls.unflexing=false;
        
        this.offset.value=0;
        
        this.update();
    }
    
    update()
    {
        this.offsets.mid_plx=this.offset.value;
        this.offsets.top_plx=this.offset.value/3;
        this.offsets.down_plx=this.offset.value/2;
        this.pivots[0].rotation.z= this.offsets.down_plx;
        this.pivots[1].rotation.z= this.offsets.mid_plx;
        this.pivots[2].rotation.z= this.offsets.top_plx;
    }
    
}

class Hand
{
    constructor(x,y,z,alpha,beta,gamma)
    {
        this.gui=
        {
            двигать_кистью:0,
            крутить_кистью:0,
            сжать_кулак:false,
            
        }
         //состояния руки
        this.controls=
        {
            //конечные состояния
            hand_default:true,
            hand_semi_state:false,
            hand_flexed:false,
            //процессы сжатия/разжатия
            hand_flexing:false,
            hand_unflexing:false,
        };
        
        this.offset=
        {
            up_down_changed:false,
            up_down_value:0,
            rotation_changed:false,
            rotation_value:0,
        }
        //ОРИЕНТАЦИЯ ЛАДОНИ 
        this.orientation=
        {
            x:x,
            y:y,
            z:z,
            alpha:alpha,
            beta:beta,
            gamma:gamma,
        }
         //СОЗДАНИЕ ЛАДОНИ
        this.palmGeometry=new THREE.BoxGeometry(3,1,2.3);
        this.mat=new THREE.MeshLambertMaterial({color: 'grey'});
        this.palm=new THREE.Mesh(this.palmGeometry,this.mat);
        this.palm.position.set(2,0,0);
        this.pivot=new THREE.Object3D();
        this.pivot.position.set(x,y,z);
        this.pivot.rotation.set(alpha,beta,gamma);
        
        
         //СОЗДАНИЕ ПАЛЬЦЕВ
        this.fingers=Array();
        for (let i=0;i<5;++i)
        {
            var f;
            i==4?f=new Finger(0,0,0,0,0,0,0.7,1.5,0.8,0.8):f=new Finger(0,0,0,0,0,0,0.5,2,0.9,0.9);
            //console.log(f);
            this.fingers.push(f);

        }
        //ПРИСОЕДИНЕНИЕ ПАЛЬЦЕВ
        this.fingers[4].rotation(Math.PI/3,0-Math.PI/6,0);
        for (let i=0;i<5;++i)
        {
            i==4?this.fingers[i].position(-1.1,-0.1,0.9):this.fingers[i].position(1.5,0,-0.9+i*0.6);
            this.palm.add(this.fingers[i].pivots[0]);  
        }
        this.pivot.add(this.palm); 
    }
    show(scene)
    {
        scene.add(this.pivot);
    }
    rotate_hand()
    {
        this.pivot.rotation.set(this.offset.rotation_value,0,this.offset.up_down_value);
        this.offset.rotation_changed=false;
    }
    up_down_hand()
    {
        this.pivot.rotation.set(this.offset.rotation_value,0,this.offset.up_down_value);
        this.offset.up_down_changed=false;
    }
    set_hand_flexing(e)
    {
        this.controls.hand_default=false;
        this.controls.hand_flexed=false;
        this.controls.hand_semi_state=true;
        this.controls.hand_flexing=e;
        this.controls.hand_unflexing=!e;
        for (let i=0;i<5;++i)
        {
            this.fingers[i].controls.flexing=e;
            this.fingers[i].controls.unflexing=!e;
            this.fingers[i].offset.changed=true;
            this.fingers[i].offset.value+=(e*(-1)+!e)*0.07;
        }
    }
    update()
    {
        this.controls.hand_default=true;
        this.controls.hand_flexed=true;
        for (let i=0;i<5;++i)
        {
            this.controls.hand_flexed&&=this.fingers[i].controls.flexed;
            this.controls.hand_default&&=this.fingers[i].controls.default;
        }
        if (this.controls.hand_flexed)
        {
            this.controls.hand_default=false;
            this.controls.hand_flexing=false;
            this.controls.hand_unflexing=false;
            this.controls.hand_semi_state=false;
        }
        else if (this.controls.hand_default)
        {
            this.controls.hand_flexing=false;
            this.controls.hand_unflexing=false;
            this.controls.hand_flexed=false;
            this.controls.hand_semi_state=false;
        }
        else
        {
            this.controls.hand_default=false;
            this.controls.hand_flexed=false;
            this.controls.hand_semi_state=true; 
            
             //console.log("4");
        }
    }
}

class Manipulator
{
    constructor(x,y,z,alpha,beta,gamma)
    {
        //ОРИЕНТАЦИЯ МАНИПУЛЯТОРА 
        this.orientation=
        {
            x:x,
            y:y,
            z:z,
            alpha:alpha,
            beta:beta,
            gamma:gamma,
        };
        this.gui=
        {
            двигать_предплечьем:0,
            двигать_рукой:0,
            крутить_рукой:0,
            
        }
        this.forearm_state=
        {
            changed:false,
            value:0,
        };
        this.shoulder_state=
        {
            changed:false,
            value:gamma,
        };
        this.rotation_shoulder_state=
        {
            changed:false,
            value:beta,
        };
        this.part1_Geometry=new THREE.BoxGeometry(8,1,1.8);
        this.part2_Geometry=new THREE.BoxGeometry(8,1,1.8);
        this.mat=new THREE.MeshPhongMaterial({color: 'grey'});
        this.part1=new THREE.Mesh(this.part1_Geometry,this.mat);
        this.part2=new THREE.Mesh(this.part2_Geometry,this.mat);
        
        this.elbow=new THREE.Object3D();
        this.shoulder=new THREE.Object3D();
        
        this.elbow.rotation.set(0,0,Math.PI/2);
        this.elbow.position.set(4,0,0);
        
        this.shoulder.position.set(x,y,z);
        this.shoulder.rotation.set(alpha,beta,gamma);
        
        this.part1.position.set(4,0,0);
        this.part2.position.set(4,0,0);
        
        this.hand=new Hand(3.5,0,0,0,0,0);
        
        this.part1.add(this.hand.pivot);
        this.elbow.add(this.part1);
        this.part2.add(this.elbow);
        this.shoulder.add(this.part2);
        
    }
    show(scene)
    {
        scene.add(this.shoulder);
    }
    move_forearm()
    {
        this.elbow.rotation.set(0,0,this.forearm_state.value);
        this.forearm_state.changed=false;
    }
    move_shoulder()
    {
        this.shoulder.rotation.set(0,this.rotation_shoulder_state.value,this.shoulder_state.value);
        this.shoulder_state.changed=false;
    }
    rotate_shoulder()
    {
        this.shoulder.rotation.set(0,this.rotation_shoulder_state.value,this.shoulder_state.value);
        this.rotation_shoulder_state.changed=false;
    }
}

function main() {
///SCENE INITIALISATION
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    const scene = new THREE.Scene();

    // create a camera, which defines where we're looking at.
    let camera = new THREE.OrthographicCamera( -window.innerWidth / 130, window.innerWidth / 130, window.innerHeight / 130,
        -window.innerHeight / 130, -200, 500 );
    camera.position.set(35,35,35);

    // create a render, sets the background color and the size
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0xadd8e6, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // show axes in the screen
    const axes = new THREE.AxisHelper(20);
    scene.add(axes);
    var light=new THREE.DirectionalLight(0xffffff,0.9);
    light.position.set(0,10,11);
    scene.add(light);
    
///GUI CONTROLS

    const cameraGui = 
    {
        changed:false,
        x:30,
        y:30,
        z:30,
        alpha:0,
        beta:0,
        gamma:0,
    };
    
///GUI INIT

    const gui = new dat.GUI();


    //const guiCamera = gui.addFolder('camera');

   /* gui.add(cameraGui,'x',-50,50).onChange(function(e){
        cameraGui.changed=true;
        cameraGui.x=e;      
    });
     gui.add(cameraGui,'y',-50,50).onChange(function(e){
        cameraGui.changed=true;
        cameraGui.y=e;      
    });
     gui.add(cameraGui,'z',-50,50).onChange(function(e){
        cameraGui.changed=true;
        cameraGui.z=e;      
    });
     gui.add(cameraGui,'alpha',-Math.PI,Math.PI).onChange(function(e){
        cameraGui.changed=true;
        cameraGui.alpha=e;      
    });
     gui.add(cameraGui,'beta',-Math.PI,Math.PI).onChange(function(e){
        cameraGui.changed=true;
        cameraGui.beta=e;      
    });
     gui.add(cameraGui,'gamma',-Math.PI,Math.PI).onChange(function(e){
        cameraGui.changed=true;
        cameraGui.gamma=e;      
    });*/
    
    
    
    var roboHand=new Manipulator(0,8,0,0,0,0);
    roboHand.show(scene);
    
 //HAND GUI HERE   
   
    //ДВИГАТЬ ОДНИМ ПАЛЬЦЕМ НЕЗАВИСИМО
    gui.add(roboHand.hand.fingers[0].gui,'двигать_пальцем',-Math.PI/2,0).onChange(function(e){
        roboHand.hand.fingers[0].offset.changed=true;
        roboHand.hand.fingers[0].offset.value=e;
    });
      //ДВИГАТЬ ОДНИМ ПАЛЬЦЕМ НЕЗАВИСИМО
    gui.add(roboHand.hand.fingers[1].gui,'двигать_пальцем',-Math.PI/2,0).onChange(function(e){
        roboHand.hand.fingers[1].offset.changed=true;
        roboHand.hand.fingers[1].offset.value=e;
    });
      //ДВИГАТЬ ОДНИМ ПАЛЬЦЕМ НЕЗАВИСИМО
    gui.add(roboHand.hand.fingers[2].gui,'двигать_пальцем',-Math.PI/2,0).onChange(function(e){
        roboHand.hand.fingers[2].offset.changed=true;
        roboHand.hand.fingers[2].offset.value=e;
    });
      //ДВИГАТЬ ОДНИМ ПАЛЬЦЕМ НЕЗАВИСИМО
    gui.add(roboHand.hand.fingers[3].gui,'двигать_пальцем',-Math.PI/2,0).onChange(function(e){
        roboHand.hand.fingers[3].offset.changed=true;
        roboHand.hand.fingers[3].offset.value=e;
    });
      //ДВИГАТЬ ОДНИМ ПАЛЬЦЕМ НЕЗАВИСИМО
    gui.add(roboHand.hand.fingers[4].gui,'двигать_пальцем',-Math.PI/2,0).onChange(function(e){
        roboHand.hand.fingers[4].offset.changed=true;
        roboHand.hand.fingers[4].offset.value=e;
    });
    //СЖАТЬ КИСТЬ В КУЛАК
    gui.add(roboHand.hand.gui,'сжать_кулак').onChange(function(e){
        roboHand.hand.set_hand_flexing(e);
    });
    gui.add(roboHand.hand.gui,'двигать_кистью',-2/3*Math.PI,2/3*Math.PI).onChange(function(e){
        roboHand.hand.offset.up_down_changed=true;
        roboHand.hand.offset.up_down_value=e;
    });
    gui.add(roboHand.hand.gui,'крутить_кистью',-0.98*Math.PI,Math.PI*0.98).onChange(function(e){
        roboHand.hand.offset.rotation_changed=true;
        roboHand.hand.offset.rotation_value=e;
    });
     gui.add(roboHand.gui,'двигать_предплечьем',0,2*Math.PI/3).onChange(function(e){
        roboHand.forearm_state.changed=true;
        roboHand.forearm_state.value=e;
    });
     gui.add(roboHand.gui,'двигать_рукой',-Math.PI/2,Math.PI/2).onChange(function(e){
        roboHand.shoulder_state.changed=true;
        roboHand.shoulder_state.value=e;
    });
     gui.add(roboHand.gui,'крутить_рукой',-Math.PI/2,Math.PI/2).onChange(function(e){
        roboHand.rotation_shoulder_state.changed=true;
        roboHand.rotation_shoulder_state.value=e;
    });
 

    // add the output of the renderer to the html element
    document.body.appendChild(renderer.domElement);

    function render() {
        /*if (cameraGui.changed)
        {
            camera.lookAt.(cameraGui.x,cameraGui.y,cameraGui.z);
          //  camera.rotation.set(cameraGui.alpha,cameraGui.beta,cameraGui.gamma);
            cameraGui.changed=false;
        }*/
       // console.log(f);
        if (roboHand.hand.fingers[0].offset.changed)
        {
           // console.log("2 in render",f);
            roboHand.hand.fingers[0].moving();
            //console.log(gui_controls);
        }
        if (roboHand.hand.fingers[1].offset.changed)
        {
           // console.log("2 in render",f);
            roboHand.hand.fingers[1].moving();
            //console.log(gui_controls);
        }
        if (roboHand.hand.fingers[2].offset.changed)
        {
           // console.log("2 in render",f);
            roboHand.hand.fingers[2].moving();
            //console.log(gui_controls);
        }
        if (roboHand.hand.fingers[3].offset.changed)
        {
           // console.log("2 in render",f);
            roboHand.hand.fingers[3].moving();
            //console.log(gui_controls);
        }
        if (roboHand.hand.fingers[4].offset.changed)
        {
           // console.log("2 in render",f);
            roboHand.hand.fingers[4].moving();
            //console.log(gui_controls);
        }
        roboHand.hand.update();
        if (roboHand.hand.offset.rotation_changed)
        {
            roboHand.hand.rotate_hand();
        }
        if (roboHand.hand.offset.up_down_changed)
        {
            roboHand.hand.up_down_hand();
        }
        if (roboHand.forearm_state.changed)
        {
            roboHand.move_forearm();
        }
        if (roboHand.shoulder_state.changed)
        {
            roboHand.move_shoulder();
        }
        if (roboHand.rotation_shoulder_state.changed)
        {
            roboHand.rotate_shoulder();
        }
        
    
     
        camera.lookAt(scene.position);

    
        // render using requestAnimationFrame
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    // call the render function
    render();
}

