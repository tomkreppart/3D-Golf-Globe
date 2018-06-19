(function () {

    var controller = function ($scope) {

    };

    controller.$inject = ['$scope'];

    var ngGlobe = function ($state, searchService) {

        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            scope: { // @ reads attribute value, = provides two-way binding, & works w/ functions
              courses: '='
            },
            template: '',

            link: function ($scope, element, attrs) {

              var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );

              renderer.setSize( window.innerWidth, window.innerHeight );
              element[0].appendChild( renderer.domElement );
              renderer.shadowMap.enabled	= true
	            window.addEventListener( 'resize', onWindowResize, false )

              var onRenderFcts= [];

              var scene	= new THREE.Scene();

              var camera	= new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100 );
              camera.position.z = 1.8;

              var light	= new THREE.AmbientLight( 0x222222 )
              scene.add( light )


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
                var lensFlare = new THREE.Lensflare();
                lensFlare.addElement( new THREE.LensflareElement( textureFlare0, 700, 0.0, flareColor ) );
                lensFlare.addElement( new THREE.LensflareElement( textureFlare2, 512, 0.0 ) );
                lensFlare.addElement( new THREE.LensflareElement( textureFlare2, 512, 0.0 ) );
                lensFlare.addElement( new THREE.LensflareElement( textureFlare2, 512, 0.0 ) );
                lensFlare.addElement( new THREE.LensflareElement( textureFlare3, 60, 0.6 ) );
                lensFlare.addElement( new THREE.LensflareElement( textureFlare3, 70, 0.7 ) );
                lensFlare.addElement( new THREE.LensflareElement( textureFlare3, 120, 0.9 ) );
                lensFlare.addElement( new THREE.LensflareElement( textureFlare3, 70, 1.0 ) );
                lensFlare.customUpdateCallback = lensFlareUpdateCallback;
                lensFlare.position.copy( light.position );
                scene.add( lensFlare );
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
                  '}',
                ].join('\n')

                // create custom material from the shader code above
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

                const mesh1 = new THREE.Mesh(new THREE.SphereGeometry( 0.502, 32, 32 ), material1)
                mesh1.rotateOnAxis(new THREE.Vector3(0.0, 1.0, 0), -Math.PI/2)
                group.add(mesh1)

                onRenderFcts.push(function(delta, now){
                  group.rotation.y += 1/32 * delta;
                  material1.uniforms.uSplit.value = material1.uniforms.uSplit.value.applyAxisAngle(new THREE.Vector3(0.0, 1.0, 0), (1/32 * delta)*-1)
                })
              }

              var nightMesh	= createNightLights()
              scene.add(nightMesh)



              //////////////////////////////////////////////////////////////////////////////////
              //		add Earth Atmosphere				//
              //////////////////////////////////////////////////////////////////////////////////


              var createAtmosphereMaterial	= function() {
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
              //		Markers Text						//
              //////////////////////////////////////////////////////////////////////////////////

              function makeTextSprite( message, parameters ) {

                  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill(); ctx.stroke(); }

                  if ( parameters === undefined ) parameters = {};
                  var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
                  var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
                  var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
                  var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
                  var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
                  var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

                  var canvas = document.createElement('canvas');
                  var context = canvas.getContext('2d');
                  context.font = "Bold " + fontsize + "px " + fontface;
                  var metrics = context.measureText( message );
                  var textWidth = metrics.width;

                  context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
                  context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

                  context.lineWidth = borderThickness;
                  roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);

                  context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
                  context.fillText( message, borderThickness, fontsize + borderThickness);

                  var texture = new THREE.Texture(canvas)
                  texture.needsUpdate = true;

                  var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
                  var sprite = new THREE.Sprite( spriteMaterial );
                  sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
                  return sprite;
              }

              //////////////////////////////////////////////////////////////////////////////////
              //		Data Points							//
              //////////////////////////////////////////////////////////////////////////////////

              function calcPosFromLatLonRad(lat,lon,radius,height) {

                var phi   = (90-lat)*(Math.PI/180);
                var theta = (lon+180)*(Math.PI/180);

                x = -((radius+height) * Math.sin(phi)*Math.cos(theta));
                y = ((radius+height) * Math.cos(phi));
                z = ((radius+height) * Math.sin(phi)*Math.sin(theta));

                return [x,y,z];
              }

              var createRandomPoints	= function() {

                meshes = [];

                var spriteMap = new THREE.TextureLoader().load( '/js/globe/images/marker-light-green.png' );
                var geometry = new THREE.BoxGeometry(0.02, 0.075, 0.02);
                var material = new THREE.MeshBasicMaterial( {color: 0x0000ff, transparent: true, opacity: 0} );

                for(var i = 0 ; i < 51 ; i++) {
                  var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff, transparent: true, opacity: 1 } );
                  spriteMaterial.depthTest = false
                  var cube = new THREE.Mesh( geometry, material );
                  var sprite = new THREE.Sprite( spriteMaterial );
                  sprite.scale.set(0.02, 0.075, 1)
                  cube.add(sprite)
                  meshes.push(cube)
                }
                return meshes
              }

              function addPoints() {
                var courses = $scope.courses
                var meshes = createRandomPoints();

                for(var i = 0; i < courses.length; i++ ) {
                  var point = meshes[i];
                  earthMesh.add(point)
                  let course = courses[i];
                  point.userData = course
                  point.name = "point"
                  latlonpoint = calcPosFromLatLonRad(
                    parseFloat(course.lat),parseFloat(course.lng), 0.5, 0
                  );
                  point.position.x = latlonpoint[0]
                  point.position.y = latlonpoint[1]
                  point.position.z = latlonpoint[2]
                }
                return meshes
              }

              $scope.$watch("courses", function(newVal, oldVal) {

                if(newVal && newVal.length) {
                  var meshes = addPoints()
                  var domEvents	= new THREEx.DomEvents(camera, renderer.domElement)

                  meshes.forEach(mesh => {
                    if (mesh.name !== "point") {
                      return
                    }

                    onRenderFcts.push(function() {
                      const distance = earthMesh.getWorldPosition().distanceTo(camera.getWorldPosition()) - camera.getWorldPosition().distanceTo(mesh.getWorldPosition())
                      var opacity;

                      if (distance > 0.25) {
                        opacity = 1
                      } else if (distance < -0.1) {
                        opacity = 0.1
                      } else {
                        opacity = distance + 0.1 * (0.9/0.35) + 0.1
                      }
                      mesh.children.forEach(function(child) {
                        child.material.opacity = opacity
                      })
                    })

                    domEvents.addEventListener(mesh, 'mousedown', function(event) {
                      event.stopPropagation()

                      if(event.target.name == "point") {
                        searchService.setCourse(event.target.userData)
                        document.querySelector('.courseInfo').style.display = 'block'
                      } else {
                        return
                      }
                    }, false)

                  })
                }
              });

              //////////////////////////////////////////////////////////////////////////////////
              //		Camera Controls							//
              //////////////////////////////////////////////////////////////////////////////////

              var controls = new THREE.OrbitControls(camera, renderer.domElement)

              //////////////////////////////////////////////////////////////////////////////////
              //		Resize Canvas							//
              //////////////////////////////////////////////////////////////////////////////////

              function onWindowResize(event) {

                renderer.setSize(window.innerWidth, window.innerHeight)
                camera.aspect = window.innerWidth / window.innerHeight
                camera.updateProjectionMatrix()

              }

              //////////////////////////////////////////////////////////////////////////////////
              //		Update							//
              //////////////////////////////////////////////////////////////////////////////////

                function update() {
                	controls.update();
                }

              //////////////////////////////////////////////////////////////////////////////////
              //		render the scene						//
              //////////////////////////////////////////////////////////////////////////////////

              onRenderFcts.push(function() {
                renderer.render(scene, camera);
                update()
              })

              //////////////////////////////////////////////////////////////////////////////////
              //		loop runner							//
              //////////////////////////////////////////////////////////////////////////////////

              var lastTimeMsec = null
              requestAnimationFrame(function animate(nowMsec) {
                // keep looping
                requestAnimationFrame(animate);
                // measure time
                lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
                var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
                lastTimeMsec	= nowMsec
                // call each update function
                onRenderFcts.forEach(function(onRenderFct) {
                  onRenderFct(deltaMsec/1000, nowMsec/1000)
                })
              })
            }
        }
    };

    angular.module('app').directive('ngGlobe', ngGlobe);

}());
