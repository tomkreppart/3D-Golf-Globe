(function () {

    // var controller = function ($scope) {
    //     $scope.myVal = $scope.title;
    // };
    //
    // controller.$inject = ['$scope'];

    var ngGlobe = function () {
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            scope: {
                title: '@' //@ reads attribute value, = provides two-way binding, & works w/ functions
            },
            template: '',
            // controller: controller,
            link: function ($scope, element, attrs) {
              // console.log(element);
              var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
              renderer.setSize( window.innerWidth, window.innerHeight );
              // document.getElementById("globe").append( renderer.domElement )
              element[0].appendChild( renderer.domElement );
              renderer.shadowMap.enabled	= true

              var onRenderFcts= [];
              var scene	= new THREE.Scene();
              var camera	= new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100 );
              camera.position.z = 1.8;
              var light	= new THREE.AmbientLight( 0x222222 )
              scene.add( light )

              // var flashlight = new THREE.PointLight( 0xffffff, 0.1, 100, 1);
              // scene.add( camera );
              // camera.add(flashlight);
              // flashlight.position.set(0,0,10);
              // flashlight.target = camera;


              //////////////////////////////////////////////////////////////////////////////////
              //		added starfield							//
              //////////////////////////////////////////////////////////////////////////////////

              var createStarfield	= function(){
                var texture	= THREE.ImageUtils.loadTexture('/js/globe/images/galaxy_starfield.png')
                var material	= new THREE.MeshBasicMaterial({
                  map	: texture,
                  side	: THREE.BackSide
                })
                var geometry	= new THREE.SphereGeometry(100, 32, 32)
                var mesh	= new THREE.Mesh(geometry, material)
                return mesh
              }

              var starSphere	= createStarfield()
              scene.add(starSphere)


              //////////////////////////////////////////////////////////////////////////////////
              //		Lensflare						//
              //////////////////////////////////////////////////////////////////////////////////
              var textureLoader = new THREE.TextureLoader();
              var textureFlare0 = textureLoader.load( "/js/globe/images/lensflare0.png" );
              var textureFlare2 = textureLoader.load( "/js/globe/images/lensflare2.png" );
              var textureFlare3 = textureLoader.load( "/js/globe/images/lensflare3.png" );
              addLight( 0.55, 0.9, 0.5, 0, 6.5, -20 );
              addLight( 0.08, 0.8, 0.5, 0, 6.5, -20 );
              addLight( 0.995, 0.5, 0.9, 0, 6.5, -20 );
              function addLight( h, s, l, x, y, z ) {
                var light = new THREE.DirectionalLight( 0xffffff, 0.8, 2000 );
                light.color.setHSL( h, s, l );
                light.position.set(0,0,-20);
                scene.add( light );
                var flareColor = new THREE.Color( 0xffffff );
                flareColor.setHSL( h, s, l + 0.5 );
                var lensFlare = new THREE.LensFlare( textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );
                lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
                lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
                lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
                lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
                lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
                lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
                lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );
                lensFlare.customUpdateCallback = lensFlareUpdateCallback;
                lensFlare.position.copy( light.position );
                scene.add( lensFlare );
                // scene.add( camera );
                // camera.add(lensFlare);
                // lensFlare.position.set(-3.5,5.5,-22);
                // lensFlare.target = camera;
              }

              function lensFlareUpdateCallback( object ) {
                var f, fl = object.lensFlares.length;
                var flare;
                var vecX = -object.positionScreen.x * 2;
                var vecY = -object.positionScreen.y * 2;

                  for( f = 0; f < fl; f++ ) {
                    flare = object.lensFlares[ f ];
                    flare.x = object.positionScreen.x + vecX * flare.distance;
                    flare.y = object.positionScreen.y + vecY * flare.distance;
                    flare.rotation = 0;
                  }

                object.lensFlares[ 2 ].y += 0.025;
                object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );
              }

              //////////////////////////////////////////////////////////////////////////////////
              //		add Earth Container and make it move					//
              //////////////////////////////////////////////////////////////////////////////////



              var containerEarth	= new THREE.Object3D()
              // containerEarth.rotateZ(-23.4 * Math.PI/180)
              containerEarth.position.z	= 0
              containerEarth.rotateOnAxis(new THREE.Vector3(0.0, 1.0, 0), -Math.PI/2)
              scene.add(containerEarth)



              var createEarth	= function(){
                var geometry	= new THREE.SphereGeometry(0.5, 32, 32)
                var material	= new THREE.MeshPhongMaterial({
                  map		: THREE.ImageUtils.loadTexture('/js/globe/images/earthgrass-ice10k.jpg'),
                  bumpMap		: THREE.ImageUtils.loadTexture('/js/globe/images/earthbump10k.jpg'),
                  bumpScale	: 0.02,
                  specularMap	: THREE.ImageUtils.loadTexture('/js/globe/images/earthspec10k.jpg'),
                  specular	: new THREE.Color('grey'),
                  shininess: 4,
                })
                var mesh	= new THREE.Mesh(geometry, material)
                return mesh
              }

              var earthMesh	= createEarth()
              earthMesh.receiveShadow	= true
              earthMesh.castShadow	= true
              containerEarth.add(earthMesh)
              onRenderFcts.push(function(delta, now){
                earthMesh.rotation.y += 1/32 * delta;
              })


              var createEarthCloud	= function() {
                var geometry	= new THREE.SphereGeometry(0.505, 32, 32)
                var material	= new THREE.MeshPhongMaterial({
                  map		: THREE.ImageUtils.loadTexture('/js/globe/images/fair_clouds_4k.png'),
                  // side		: THREE.DoubleSide,
                  transparent	: true,
                  opacity		: 0.8
                })
                var mesh	= new THREE.Mesh(geometry, material)
                return mesh
              }

              //////////////////////////////////////////////////////////////////////////////////
              //		add Night Lights				//
              //////////////////////////////////////////////////////////////////////////////////
              var createNightLights	= function(){
                var vertexShader	= [
                  'varying vec2 vUv;',
                  'varying vec3 vPosition;',
                  'void main()',
                  '{',
                    'vUv = uv;',
                    'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
                    'gl_Position = projectionMatrix * mvPosition;',
                    'vPosition = position;',
                  '}'
                ].join('\n')
                var fragmentShader	= [
                  'uniform sampler2D texture;',
                  'varying vec2 vUv;',
                  'varying vec3 vPosition;',
                  'uniform vec3 uSplit;',

                  'void main( void ) {',
                    'vec3 color1 = texture2D(texture, vUv).rgb;',
                    'gl_FragColor = vec4(color1, dot(uSplit, vPosition) * 3.0);',
                    //'gl_FragColor = vec4(dot(uSplit, vPosition) * 2.0, 0, 0, 1);',
                  '}',
                ].join('\n')

                const textureLoader = new THREE.TextureLoader()

                const group = new THREE.Group()
                scene.add(group)

                const uTexture1 = {
                	texture: { value: textureLoader.load("/js/globe/images/earthlights10k.jpg") },
                	uSplit: { value: new THREE.Vector3(1, 0, 0) },
                }
                uTexture1.texture.value.wrapS = uTexture1.texture.value.wrapT = THREE.RepeatWrapping;
                const material1 = new THREE.ShaderMaterial({
                	uniforms: uTexture1,
                	vertexShader: vertexShader,
                	fragmentShader: fragmentShader,
                	transparent: true,
                });
                const mesh1 = new THREE.Mesh( new THREE.SphereGeometry( 0.502, 32, 32 ), material1 )
                mesh1.rotateOnAxis(new THREE.Vector3(0.0, 1.0, 0), -Math.PI/2)
                group.add(mesh1)

                // const uTexture2 = {
                // 	texture: { value: textureLoader.load("/js/globe/images/earthlights10k.jpg") },
                // 	uSplit: { value: new THREE.Vector3(0, 0, 1) },
                // }
                // uTexture2.texture.value.wrapS = uTexture2.texture.value.wrapT = THREE.RepeatWrapping;
                // const material2 = new THREE.ShaderMaterial({
                // 	uniforms: uTexture2,
                // 	vertexShader: vertexShader,
                // 	fragmentShader: fragmentShader,
                // 	transparent: true,
                // });
                // const mesh2 = new THREE.Mesh( new THREE.SphereGeometry( 0.502, 32, 32 ), material2 )
                // // mesh2.rotateOnAxis(new THREE.Vector3(0.0, 1.0, 0), Math.PI/100)
                // group.add(mesh2)

                // const spotLight = new THREE.SpotLight( 0xffffff );
                // spotLight.position.set(0, 0, -20);
                //
                // spotLight.shadow.camera.near = 500
                // spotLight.shadow.camera.far = 4000
                // spotLight.shadow.camera.fov = 30
                // spotLight.target = mesh1

                // scene.add( spotLight );
                // scene.add(new THREE.SpotLightHelper(spotLight))

                onRenderFcts.push(function(delta, now){
                  group.rotation.y += 1/32 * delta;
                  material1.uniforms.uSplit.value = material1.uniforms.uSplit.value.applyAxisAngle(new THREE.Vector3(0.0, 1.0, 0), (1/32 * delta)*-1)
                  // material2.uniforms.uSplit.value = material2.uniforms.uSplit.value.applyAxisAngle(new THREE.Vector3(0.0, 1.0, 0), Math.PI/100)
                })
              }

              var nightMesh	= createNightLights()
              scene.add(nightMesh)



              //////////////////////////////////////////////////////////////////////////////////
              //		add Earth Atmosphere				//
              //////////////////////////////////////////////////////////////////////////////////


              var createAtmosphereMaterial	= function(){
              var vertexShader	= [
                'varying vec3	vVertexWorldPosition;',
                'varying vec3	vVertexNormal;',

                'void main(){',
                '	vVertexNormal	= normalize(normalMatrix * normal);',

                '	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;',

                '	// set gl_Position',
                '	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
                '}',

                ].join('\n')
              var fragmentShader	= [
                'uniform vec3	glowColor;',
                'uniform float	coeficient;',
                'uniform float	power;',

                'varying vec3	vVertexNormal;',
                'varying vec3	vVertexWorldPosition;',

                'void main(){',
                '	vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;',
                '	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;',
                '	viewCameraToVertex	= normalize(viewCameraToVertex);',
                '	float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);',
                '	gl_FragColor		= vec4(glowColor, intensity);',
                '}',
              ].join('\n')

              // create custom material from the shader code above
              //   that is within specially labeled script tags
              var material	= new THREE.ShaderMaterial({
                uniforms: {
                  coeficient	: {
                    type	: "f",
                    value	: 1.0
                  },
                  power		: {
                    type	: "f",
                    value	: 2
                  },
                  glowColor	: {
                    type	: "c",
                    value	: new THREE.Color('pink')
                  },
                },
                vertexShader	: vertexShader,
                fragmentShader	: fragmentShader,
                //blending	: THREE.AdditiveBlending,
                transparent	: true,
                depthWrite	: false,
              });
              return material
              }


              var geometry	= new THREE.SphereGeometry(0.5, 32, 32)
              var material	= createAtmosphereMaterial()
              material.uniforms.glowColor.value.set(0x00b3ff)
              material.uniforms.coeficient.value	= 0.8 // opacity
              material.uniforms.power.value		= 2.0 // intensity (high num = low inten)
              var mesh	= new THREE.Mesh(geometry, material );
              mesh.scale.multiplyScalar(1.01); // outer r
              containerEarth.add( mesh );

              var geometry	= new THREE.SphereGeometry(0.5, 32, 32)
              var material	= createAtmosphereMaterial()
              material.side	= THREE.BackSide
              material.uniforms.glowColor.value.set(0x00b3ff)
              material.uniforms.coeficient.value	= 0.4 // opacity
              material.uniforms.power.value		= 8.0 // intensity (high num = low inten)
              var mesh	= new THREE.Mesh(geometry, material );
              mesh.scale.multiplyScalar(1.15); // outer r
              containerEarth.add( mesh );

              var earthCloud	= createEarthCloud()
              earthCloud.receiveShadow	= true
              earthCloud.castShadow	= true
              containerEarth.add(earthCloud)
              onRenderFcts.push(function(delta, now){
                earthCloud.rotation.y += 1/24 * delta;
              })
              //////////////////////////////////////////////////////////////////////////////////
              //		Data Points							//
              //////////////////////////////////////////////////////////////////////////////////
              function calcPosFromLatLonRad(lat,lon,radius,height){

                var phi   = (90-lat)*(Math.PI/180);
                var theta = (lon+180)*(Math.PI/180);

                x = -((radius+height) * Math.sin(phi)*Math.cos(theta));
                y = ((radius+height) * Math.cos(phi));
                z = ((radius+height) * Math.sin(phi)*Math.sin(theta));


                // console.log([x,y,z]);
                return [x,y,z];
              }

              var createRandomPoints	= function(){

                meshes=[];
                for(var i = 0 ; i < 10 ; i++){

                	var geometry	= new THREE.SphereGeometry(0.025, 20, 20)
                	var material	= new THREE.MeshBasicMaterial({
                		color: new THREE.Color('white')
                	})
                	var mesh	= new THREE.Mesh(geometry, material)
                	meshes.push(mesh);
                }
                	return meshes
              }

              // var mesh	= createEarth()
              // scene.add(mesh)
              // currentMesh	= earthMesh

              latlons = [[36.5802249,-121.9741049], [-37.9678325,145.0253219]];

              function addPoints(){
                var meshes = createRandomPoints();
                for(var i = 0; i< meshes.length; i++ ) {
                  var point = meshes[i];
                  earthMesh.add(point)

                  let latlon = latlons[Math.floor(Math.random()*latlons.length)];

                  latlonpoint = calcPosFromLatLonRad(latlon[0],latlon[1], 0.5, 0.01);
                  point.position.x = latlonpoint[0]
                  point.position.y = latlonpoint[1]
                  point.position.z = latlonpoint[2]
                  // new THREE.Vector3(latlonpoint[0],latlonpoint[1],latlonpoint[2]);
                  // console.log(latlonpoint);
                  // console.log(point.position.x);
                }
              }

              addPoints();
              //////////////////////////////////////////////////////////////////////////////////
              //		Camera Controls							//
              //////////////////////////////////////////////////////////////////////////////////

              var controls = new THREE.OrbitControls(camera, renderer.domElement)

              //////////////////////////////////////////////////////////////////////////////////
              //		render the scene						//
              //////////////////////////////////////////////////////////////////////////////////
              onRenderFcts.push(function(){
                renderer.render( scene, camera );
                // console.log(renderer.domElement.toDataURL());
                controls.update()
              })

              //////////////////////////////////////////////////////////////////////////////////
              //		loop runner							//
              //////////////////////////////////////////////////////////////////////////////////
              var lastTimeMsec= null
              requestAnimationFrame(function animate(nowMsec){
                // keep looping
                requestAnimationFrame( animate );
                // measure time
                lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
                var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
                lastTimeMsec	= nowMsec
                // call each update function
                onRenderFcts.forEach(function(onRenderFct){
                  onRenderFct(deltaMsec/1000, nowMsec/1000)
                })
              })
            }
        }
    };

    angular.module('app').directive('ngGlobe', ngGlobe);

}());


// function calcPosFromLatLonRad(lat,lon,radius){
//
// var phi   = (90-lat)*(Math.PI/180);
// var theta = (lon+180)*(Math.PI/180);
//
// x = -((radius) * Math.sin(phi)*Math.cos(theta));
// z = ((radius) * Math.sin(phi)*Math.sin(theta));
// y = ((radius) * Math.cos(phi));
//
//
// 	console.log([x,y,z]);
//    return [x,y,z];
// }


// var createDataPoints = function(){
//
// meshes=[];
// for(var i = 0 ; i < 10 ; i++){
//
// 	var geometry	= new THREE.SphereGeometry(0.025, 20, 20)
// 	var material	= new THREE.MeshBasicMaterial({
// 		color: new THREE.Color('white')
// 	})
// 	var mesh	= new THREE.Mesh(geometry, material)
// 	meshes.push(mesh);
// }


// latlons = [[40.7142700,-74.0059700], [52.5243700,13.4105300]];
// function addPoints(){
//  var meshes = createDataPoints();
//  for(var i = 0; i< meshes.length; i++ ){
//    mesh = meshes[i];
//  currentMesh.add(mesh)
//
//  latlon=latlons[Math.floor(Math.random()*latlons.length)];
//
//  latlonpoint = calcPosFromLatLonRad(latlon[0],latlon[1], 0.5);
//  mesh.position = new THREE.Vector3(latlonpoint[0],latlonpoint[1],latlonpoint[2]);
//  }
//
// }
//
// addPoints();
