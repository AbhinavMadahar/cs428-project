import './style.css';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import * as dat from 'dat.gui';
import { Interaction } from 'three.interaction';

// Loading
const textureLoader = new THREE.TextureLoader();
const snakeTexture = textureLoader.load('/normal-maps/snake.png');
const obj_loader = new OBJLoader();
const mtl_loader = new MTLLoader();

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Sizes
 */
 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight * 0.8
};

/**
 * Camera
 */
// Base camera

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 7;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const interaction = new Interaction(renderer, scene, camera);

// Set up the skybox
let materialArray = [];
let texture_ft = new THREE.TextureLoader().load( 'https://cs428-project.s3.us-east-2.amazonaws.com/skybox/yonder_ft.jpg');
let texture_bk = new THREE.TextureLoader().load( 'https://cs428-project.s3.us-east-2.amazonaws.com/skybox/yonder_bk.jpg');
let texture_up = new THREE.TextureLoader().load( 'https://cs428-project.s3.us-east-2.amazonaws.com/skybox/yonder_up.jpg');
let texture_dn = new THREE.TextureLoader().load( 'https://cs428-project.s3.us-east-2.amazonaws.com/skybox/yonder_dn.jpg');
let texture_rt = new THREE.TextureLoader().load( 'https://cs428-project.s3.us-east-2.amazonaws.com/skybox/yonder_rt.jpg');
let texture_lf = new THREE.TextureLoader().load( 'https://cs428-project.s3.us-east-2.amazonaws.com/skybox/yonder_lf.jpg');

materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));

for (let i = 0; i < 6; i++) {
   materialArray[i].side = THREE.BackSide;
}
let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
let skybox = new THREE.Mesh( skyboxGeo, materialArray );
scene.add(skybox);  
animate();

function animate() {
    renderer.render(scene,camera);
    requestAnimationFrame(animate);
}

//Set up the grass ground
var grassTex = new THREE.TextureLoader().load('https://cs428-project.s3.us-east-2.amazonaws.com/grass/grass_mesh.png'); 
grassTex.wrapS = THREE.RepeatWrapping; 
grassTex.wrapT = THREE.RepeatWrapping; 
grassTex.repeat.x = 256; 
grassTex.repeat.y = 256; 
var groundMat = new THREE.MeshBasicMaterial({map:grassTex}); 

var groundGeo = new THREE.PlaneGeometry(400,400); 

var ground = new THREE.Mesh(groundGeo,groundMat); 
ground.position.y = -1.9;
ground.rotation.x = -Math.PI/2;  
ground.doubleSided = true; 
scene.add(ground);

// Objects
const geometry = new THREE.CylinderGeometry(1, 1, 5, 64, 64, false);

// Materials
const material = new THREE.MeshStandardMaterial();
material.normalMap = snakeTexture;
material.color = new THREE.Color(0x000000);

const red = document.getElementById('red');
const green = document.getElementById('green');
const blue = document.getElementById('blue');

const updateTorsoColor = (event) => {
    material.color.setRGB(red.value / 255, green.value / 255, blue.value / 255);
}

red.onchange = updateTorsoColor;
green.onchange = updateTorsoColor;
blue.onchange = updateTorsoColor;

updateTorsoColor();

// Mesh
// const torso = new THREE.Mesh(geometry, material);
// scene.add(torso);

// Import new torso
const torso = new THREE.Mesh();
mtl_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/torso/Project+Name.mtl', function (materials) {
    materials.preload();
    obj_loader.setMaterials(materials);
    obj_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/torso/Project+Name.obj', function (torso) {
        torso.scale.set(0.04,0.04,0.04);
        torso.position.set(-1,-1,0.5);
        scene.add(torso);
    });
});

// Lights
const numberOfLights = 10;
for (let i = 0; i < numberOfLights; i++) {
    const pointLight = new THREE.PointLight(0xffffff, 0.4);
    pointLight.position.x = 10 * (Math.random() - 0.5);
    pointLight.position.y = 10 * (Math.random() - 0.5);
    pointLight.position.z = 10 * (Math.random() - 0.5);
    scene.add(pointLight);
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Controls
const controls1 = new OrbitControls(camera, canvas)
controls1.enableDamping = true;

/**
 * Animate
 */

let mouseX = 0;
let mouseY = 0;

let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

let radius = 7;

const moveCamera = (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);

    const x = mouseX / window.innerWidth;
    const y = mouseY / window.innerHeight;

    // project x and y onto a sphere with radius 7
    // from mathematics, position.x ^ 2 + position.y ^ 2 + position.z^2 == radius^2

    camera.position.x = radius * Math.cos(2 * x * Math.PI);  // x moves in and out
    camera.position.y = radius * Math.sin(y * Math.PI);  // y moves up and down
    camera.position.z = radius * Math.sin(2 * x * Math.PI); // z moves left and right

    camera.lookAt(0, 0, 0);
};

document.addEventListener('keydown', (event) => {
    if (event.key === 'c') {
        document.addEventListener('mousemove', moveCamera);
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'c') {
        document.removeEventListener('mousemove', moveCamera);
    }
});

canvas.onwheel = (event) => {
    event.preventDefault();

    // if the radius is too small, then the user would look inside the animal, which would look buggy.
    // if the radius is too large, then the user would be unable to see the animal.
    // here, we bind the radius to only appear in an appropriate range.
    if (radius + event.deltaY * 0.01 > 10 || radius + event.deltaY * 0.01 < 3) {
        return;
    }

    camera.position.x *= (radius + event.deltaY * 0.01) / radius;
    camera.position.y *= (radius + event.deltaY * 0.01) / radius;
    camera.position.z *= (radius + event.deltaY * 0.01) / radius;

    radius += event.deltaY * 0.01;

    camera.lookAt(0, 0, 0);
};

const bodyparts = [];
const addBodyPart = (event) => {
    const location = event.intersects[0].point;  // location of the click
    console.log("Location of the click: ", location);
    // now we create a new bodypart.
    // the user can control what kind of bodypart to make by selecting one from the drop-down.
    // also, this addBodyPart method is added to the new bodypart so that the user can add bodyparts on other bodyparts

    var bodypartType = document.getElementById('eyes').value;
    switch (bodypartType) {
        case 'Eye1':
            // add the eyeball
            const eyeballRadius = 0.5;

            const eyeballGeometry = new THREE.SphereGeometry(eyeballRadius, 64, 64);
            const eyeballMaterial = new THREE.MeshStandardMaterial();
            eyeballMaterial.color = new THREE.Color(0xffffff);
            const eyeballMesh = new THREE.Mesh(eyeballGeometry, eyeballMaterial);
            scene.add(eyeballMesh);
            eyeballMesh.position.set(location.x, location.y, location.z);
            eyeballMesh.on('click', addBodyPart);

            // add a pupil
            const pupilGeometry = new THREE.SphereGeometry(0.1, 64, 64);
            const pupilMaterial = new THREE.MeshStandardMaterial();
            pupilMaterial.color = new THREE.Color(0x000000);
            const pupilMesh = new THREE.Mesh(pupilGeometry, pupilMaterial);
            scene.add(pupilMesh);
            // when we make the pupil, we point it towards the current camera position.
            // to implement this, we take the vector difference between the center of the eyeball and the camera position.
            // after that, we scale that vector difference so it has magnitude equal to the radius of the eyeball, and then we place the pupil at the end.
            let difference = [camera.position.x - location.x, camera.position.y - location.y, camera.position.z - location.z];
            let distanceToCamera = Math.sqrt(difference[0] * difference[0] + difference[1] * difference[1] + difference[2] * difference[2]); 
            difference = [difference[0] / distanceToCamera,
                          difference[1] / distanceToCamera,
                          difference[2] / distanceToCamera];
            const pupilLocation = [location.x + difference[0] * eyeballRadius,
                                   location.y + difference[1] * eyeballRadius,
                                   location.z + difference[2] * eyeballRadius];
            pupilMesh.position.set(...pupilLocation);
            pupilMesh.on('click', addBodyPart);

            bodyparts.push([eyeballMesh, pupilMesh]);
            break;
        
        case 'Eye2':
            // Create a material for the weird arm
            mtl_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B72_1+(2).mtl', function (materials) {
                materials.preload();
                // Load the weird arm
                obj_loader.setMaterials(materials);
                obj_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B72_1+(2).obj', function (arm) {
                    arm.scale.set(5,5,5);
                    objects.push(arm);
                    scene.add(arm);                   
                    //arm.position.set(location.x, location.y-5, location.z+0.5);
                    arm.position.set(-1,-1,0);
                    console.log("EYE2");
                    //arm.lookAt(torso.position.x, 1000, torso.position.z);
                    //arm.on('click', addBodyPart);
                    //bodyparts.push([arm]);
                    
                });
            });
            document.getElementById("eyes").selectedIndex = 0;
            break;

        case 'Eye3':
            mtl_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B711.mtl', function (materials) {
                materials.preload();
                obj_loader.setMaterials(materials);
                obj_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B711.obj', function (arm) {
                    arm.scale.set(5,5,5);
                    objects.push(arm);
                    scene.add(arm);
                    arm.position.set(-1,-1,0);
                    console.log("EYE3");
                    

                });
            });
            document.getElementById("eyes").selectedIndex = 0;
            break;

        case 'Eye4':
            mtl_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B712.mtl', function (materials) {
                materials.preload();
                obj_loader.setMaterials(materials);
                obj_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B712.obj', function (arm) {
                    arm.scale.set(5,5,5);
                    objects.push(arm);
                    scene.add(arm);
                    arm.position.set(-1,-1,0);
                    console.log("EYE4");
                });
            });
            document.getElementById("eyes").selectedIndex = 0;
            break;

        case 'Eye5':
                mtl_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B713.mtl', function (materials) {
                    materials.preload();
                    obj_loader.setMaterials(materials);
                    obj_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B713.obj', function (arm) {
                        arm.scale.set(5,5,5);
                        objects.push(arm);
                        scene.add(arm);
                        arm.position.set(-1,-1,0);
                        console.log("EYE5");
                    });
                });
                document.getElementById("eyes").selectedIndex = 0;
                break;

        case 'Eye6':
                mtl_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B77.mtl', function (materials) {
                    materials.preload();
                    obj_loader.setMaterials(materials);
                    obj_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/eyes/%D0%B3%D0%BB%D0%B0%D0%B77.obj', function (arm) {
                        arm.scale.set(5,5,5);
                        objects.push(arm);
                        scene.add(arm);
                        arm.position.set(-1,-1,0);
                        console.log("EYE6");
                    });
                });
                document.getElementById("eyes").selectedIndex = 0;
                break;
    }

    bodypartType = document.getElementById('noses').value;
    switch (bodypartType) {
        case 'Nose1':
            mtl_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/noses/n3.mtl', function (materials) {
                materials.preload();
                obj_loader.setMaterials(materials);
                obj_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/noses/n3.obj', function (arm) {
                    arm.scale.set(0.2,0.2,0.2);
                    objects.push(arm);
                    scene.add(arm);
                    arm.position.set(-1,-1,0);
                    console.log("NOSE1");
                });
            });
            document.getElementById("noses").selectedIndex = 0;
            break;

        case 'Nose2':
            mtl_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/noses/n4.mtl', function (materials) {
                materials.preload();
                obj_loader.setMaterials(materials);
                obj_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/noses/n4.obj', function (arm) {
                    arm.scale.set(0.2,0.2,0.2);
                    objects.push(arm);
                    scene.add(arm);
                    arm.position.set(-1,-1,0);
                    console.log("NOSE2");
                 });
            });
            document.getElementById("noses").selectedIndex = 0;
            break;
        case 'Nose3':
            mtl_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/noses/n5.mtl', function (materials) {
                materials.preload();
                obj_loader.setMaterials(materials);
                obj_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/noses/n5.obj', function (arm) {
                    arm.scale.set(0.5,0.5,0.5);
                    objects.push(arm);
                    scene.add(arm);
                    arm.position.set(-1,-1,0);
                    console.log("NOSE3");
                });
            });
            document.getElementById("noses").selectedIndex = 0;
            break;

        case 'Nose4':
            mtl_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/noses/n6.mtl', function (materials) {
                materials.preload();
                obj_loader.setMaterials(materials);
                obj_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/noses/n6.obj', function (arm) {
                    arm.scale.set(0.5,0.5,0.5);
                    objects.push(arm);
                    scene.add(arm);
                    arm.position.set(-1,-1,0);
                    console.log("NOSE4");
                });
            });
            document.getElementById("noses").selectedIndex = 0;
            break;
        case 'Nose5':
            mtl_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/noses/n7.mtl', function (materials) {
                materials.preload();
                obj_loader.setMaterials(materials);
                obj_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/noses/n7.obj', function (arm) {
                    arm.scale.set(0.2,0.2,0.2);
                    objects.push(arm);
                    scene.add(arm);
                    arm.position.set(-1,-1,0);
                    console.log("NOSE5");
                });
            });
            document.getElementById("noses").selectedIndex = 0;
            break;
    }

    bodypartType = document.getElementById('ears').value;
    switch (bodypartType) {
        case 'Ear1':
            mtl_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/ears/ear3.mtl', function (materials) {
                materials.preload();
                obj_loader.setMaterials(materials);
                obj_loader.load('https://cs428-project.s3.us-east-2.amazonaws.com/ears/ear3.obj', function (arm) {
                    arm.scale.set(4,4,4);
                    objects.push(arm);
                    scene.add(arm);
                    arm.position.set(-1,-1,-1);
                    console.log("EAR1");
                });
            });
            document.getElementById("ears").selectedIndex = 0;
            break

    }

}

var objects = [];
const controls = new DragControls( objects, camera, renderer.domElement ); 

scene.on('click', addBodyPart);

// controls.addEventListener( 'dragstart', function ( event ) {
//     console.log("dragstart");
// 	event.object.material.emissive.set( 0xaaaaaa );
// } );
// controls.addEventListener( 'dragend', function ( event ) {
// 	event.object.material.emissive.set( 0x000000 );
// } );

// window.addEventListener('mousemove', onMouseMove, false);
// var mouse = new THREE.Vector2()
// function onMouseMove(e) {
//     mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
//     mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
//   }

// the undo button removes the last body part
document.getElementById('undo').onclick = (event) => {
    for (let component of bodyparts.pop()) {
        scene.remove(component);
    }
};