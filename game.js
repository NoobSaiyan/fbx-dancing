import * as THREE from './node_modules/three/build/three.module.js'
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js'
import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader.js'

let camera, scene, renderer, controls, stats
let player = {}
let assetsPath = './assets/'
let clock = new THREE.Clock()
init()
animate()

function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    2000
  )
  camera.position.set(112, 100, 400)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xa0a0a0)
  scene.fog = new THREE.Fog(0xa0a0a0, 700, 1800)

  let light = new THREE.HemisphereLight(0xffffff, 0x444444)
  light.position.set(0, 200, 0)
  scene.add(light)

  light = new THREE.DirectionalLight(0xffffff)
  light.position.set(0, 200, 100)
  light.castShadow = true
  light.shadow.camera.top = 180
  light.shadow.camera.bottom = -100
  light.shadow.camera.left = -120
  light.shadow.camera.right = 120
  scene.add(light)

  // ground
  let mesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(4000, 4000),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  )
  mesh.rotation.x = -Math.PI / 2
  //   mesh.position.y = -100
  mesh.receiveShadow = true
  scene.add(mesh)

  let grid = new THREE.GridHelper(4000, 60, 0x000000, 0x000000)
  //grid.position.y = -100;
  grid.material.opacity = 0.2
  grid.material.transparent = true
  scene.add(grid)

  // model
  const loader = new FBXLoader()

  loader.load('./Samba Dancing.fbx', function (object) {
    object.mixer = new THREE.AnimationMixer(object)
    player.mixer = object.mixer
    player.root = object.mixer.getRoot()

    // object.name = 'FireFighter'

    object.traverse(function (child) {
      if (child.isMesh) {
        child.material.map = null
        child.castShadow = true
        child.receiveShadow = false
      }
    })
    // const tLoader = new THREE.TextureLoader()
    // tLoader.load(
    //   `${assetsPath}images/SimplePeople_FireFighter_Brown.png`,
    //   function (texture) {
    //     object.traverse(function (child) {
    //       if (child.isMesh) {
    //         child.material.map = texture
    //       }
    //     })
    //   }
    // )

    scene.add(object)
    player.object = object
    player.mixer.clipAction(object.animations[0]).play()

    animate()
  })

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  document.body.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize, false)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 150, 0)
  controls.update()
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  requestAnimationFrame(animate)
  const dt = clock.getDelta()
  if (player.mixer !== undefined) player.mixer.update(dt)
  renderer.render(scene, camera)
}
