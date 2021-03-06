var camera = undefined,
    scene = undefined,
    renderer = undefined,
    light = undefined,
    flashMesh = undefined,
    mouseX = undefined,
    mouseY = undefined,
    maze = undefined,
    mazeMesh = undefined,
    mazeDimension = 11,
    planeMesh = undefined,
    ballMesh = undefined,
    controllerAxis = [0, 0],
    gameState = undefined,
    BALL_RADIUS = 0.20,
    NUMBER_OF_LEVELS = 4,
    COLLISION_IMPULSE_THRESHOLD = 1.5,
    currentLevel = 0,
    yellowColor = {
        r: 231,
        g: 212,
        b: 65
    },
    redColor = {
        r: 235,
        g: 53,
        b: 76
    },
    getFlashColor = utils.colors.transition(yellowColor, redColor, 0.05);

// Box2D shortcuts
b2World = Box2D.Dynamics.b2World,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2Settings = Box2D.Common.b2Settings,
    b2Vec2 = Box2D.Common.Math.b2Vec2,

    // Box2D world variables 
    wWorld = undefined,
    wBall = undefined,
    wContactListener = undefined,

    // Sync stuff
    syncClient = undefined,
    gameStateDoc = undefined,
    controllerStateDoc = undefined,
    wallCollisionList = undefined,

    // Controller variables
    ACCEL_FACTOR = 10,
    ACCEL_THRESHOLD = 0.3,
    NUM_FILTER_POINTS = 4,
    FORCE_MULTIPLIER = 4.5,
    newAccel = {
        x: 0.0,
        y: 0.0
    },
    oldAccel = {
        x: 0.0,
        y: 0.0
    },
    diffAccel = {
        x: 0.0,
        y: 0.0
    },
    newAxis = [0, 0],
    rawAccelX = [0, 0, 0, 0],
    rawAccelY = [0, 0, 0, 0];

// Assets
var $mainMenu = undefined,
    $startGame = undefined,
    $mainMenuFooter = undefined,
    $splashScreen = undefined,
    $splashScreenTitle = undefined,
    $splashScreenLevelName = undefined,
    $splashScreenLevelDetails = undefined,
    $splashScreenLevelDescription = undefined,
    $splashLevelCompleted = undefined,
    $splashLevelCompletedGraphic = undefined,
    $splashScreenGameOverMenu = undefined,
    $pauseScreen = undefined,
    $gameCanvasDisplay = undefined,
    $level = undefined,
    $levelName = undefined,
    levelNames = [
        'MAIN MENU',
        'CAVE OF LAST-CALL',
        'CASTLE CALLDROPSALOT',
        'TELECOM TOWERS',
        'TOMORROWLAND'
     ],
    levelDescriptions = [
        'Main Menu',
        "Roll your stone through the cave to complete the first “telestone” call of all time!",
        'Carry your spark through the tower to light the signal fire and save the castle!',
        'Navigate your energy node through the global communications infrastructure to the PBX box across the world!',
        'Roll your happy ball of light through a maze of infinite rainbows.'
    ],
    assets = [];


// Preload textures
for (var i = 1; i <= NUMBER_OF_LEVELS; i++) {
    var tempAsset = {
        ball: THREE.ImageUtils.loadTexture('imgs/level_' + i + '/ball.png'),
        concrete: THREE.ImageUtils.loadTexture('imgs/level_' + i + '/concrete.png'),
        brick: THREE.ImageUtils.loadTexture('imgs/level_' + i + '/brick.png'),
    }
    assets.push(tempAsset)
}


function createPhysicsWorld() {
    // Create the world object
    wWorld = new b2World(new b2Vec2(0, 0), true);

    // Create the ball
    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.Set(1, 1);
    wBall = wWorld.CreateBody(bodyDef);
    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.0;
    fixDef.restitution = 0.05;
    fixDef.shape = new b2CircleShape(BALL_RADIUS);
    wBall.CreateFixture(fixDef);

    // Create the maze
    bodyDef.type = b2Body.b2_staticBody;
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(0.5, 0.5);
    for (var i = 0; i < maze.dimension; i++) {
        for (var j = 0; j < maze.dimension; j++) {
            if (maze[i][j]) {
                bodyDef.position.x = i;
                bodyDef.position.y = j;
                wWorld.CreateBody(bodyDef).CreateFixture(fixDef);
            }
        }
    }

    // Wall hits
    wContactListener = new Box2D.Dynamics.b2ContactListener;
    // http://www.box2dflash.org/docs/2.1a/reference/Box2D/Dynamics/b2ContactListener.html
    wContactListener.PostSolve = function (contact, impulse) {
        var impulseSum = impulse.normalImpulses.reduce(function (accum, item) {
            return accum + item;
        }, 0);

        // Collision impulse threshold. Tweak as needed
        if (impulseSum >= COLLISION_IMPULSE_THRESHOLD) {
            // flash screen
            flash();
            wallCollisionList.push({impulse: impulseSum })
                .catch(function (err) {
                    console.log(err)
                });
        }
    }
    wWorld.SetContactListener(wContactListener);
}


function generate_maze_mesh(field) {
    var dummy = new THREE.Geometry();
    for (var i = 0; i < field.dimension; i++) {
        for (var j = 0; j < field.dimension; j++) {
            if (field[i][j]) {
                var geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
                var mesh_ij = new THREE.Mesh(geometry);
                mesh_ij.position.x = i;
                mesh_ij.position.y = j;
                mesh_ij.position.z = 0.5;
                mesh_ij.updateMatrix();
                dummy.merge(mesh_ij.geometry, mesh_ij.matrix);
            }
        }
    }
    var material = new THREE.MeshPhongMaterial({
        map: assets[currentLevel].brick
    });
    var mesh = new THREE.Mesh(dummy, material)
    return mesh;
}


function createRenderWorld() {
    // Create the scene object
    scene = new THREE.Scene();

    // Flash Plane
    var flashPlane = new THREE.PlaneGeometry(mazeDimension * 10, mazeDimension * 10, mazeDimension, mazeDimension);
    var flashMaterial = new THREE.MeshBasicMaterial({
        color: utils.colors.rgbToString(yellowColor),
        opacity: 0,
        transparent: true
    });
    flashMesh = new THREE.Mesh(flashPlane, flashMaterial);
    flashMesh.position.z = 2;
    scene.add(flashMesh);

    // Add the light
    light = new THREE.PointLight(0xffffff, 1);
    light.position.set(1, 1, 1.3);
    scene.add(light);

    // Add the ball
    g = new THREE.SphereGeometry(BALL_RADIUS, 32, 16);
    m = new THREE.MeshPhongMaterial({
        map: assets[currentLevel].ball
    });
    ballMesh = new THREE.Mesh(g, m);
    ballMesh.position.set(1, 1, BALL_RADIUS);
    scene.add(ballMesh);

    // Add the camera
    var aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 1, 1000);
    camera.position.set(1, 1, 5);
    scene.add(camera);

    // Add the maze
    mazeMesh = generate_maze_mesh(maze);
    scene.add(mazeMesh);

    //  Add the ground
    g = new THREE.PlaneGeometry(mazeDimension * 10, mazeDimension * 10, mazeDimension, mazeDimension);
    var planeTexture = assets[currentLevel].concrete
    planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
    planeTexture.repeat.set(mazeDimension * 5, mazeDimension * 5);
    m = new THREE.MeshPhongMaterial({
        map: planeTexture
    });
    planeMesh = new THREE.Mesh(g, m);
    planeMesh.position.set((mazeDimension - 1) / 2, (mazeDimension - 1) / 2, 0);
    scene.add(planeMesh);
}


function updatePhysicsWorld() {
    // Apply "friction"
    var lv = wBall.GetLinearVelocity();
    lv.Multiply(.95);
    wBall.SetLinearVelocity(lv);

    // Apply user-directed force
    var f = new b2Vec2(controllerAxis[0] * FORCE_MULTIPLIER * wBall.GetMass(),
        controllerAxis[1] * FORCE_MULTIPLIER * wBall.GetMass());
    wBall.ApplyImpulse(f, wBall.GetPosition());
    controllerAxis = [0, 0];

    // Step
    // a: time to pass in seconds
    // b: how strong to correct velocity
    // c: how strong to correct position
    wWorld.Step(1 / 120, 1, 1);
}


function updateRenderWorld() {
    // Update ball position
    var stepX = wBall.GetPosition().x - ballMesh.position.x;
    var stepY = wBall.GetPosition().y - ballMesh.position.y;
    ballMesh.position.x += stepX;
    ballMesh.position.y += stepY;

    // Update ball rotation
    var tempMat = new THREE.Matrix4();
    tempMat.makeRotationAxis(new THREE.Vector3(0, 1, 0), stepX / BALL_RADIUS);
    tempMat.multiply(ballMesh.matrix);
    ballMesh.matrix = tempMat;
    tempMat = new THREE.Matrix4();
    tempMat.makeRotationAxis(new THREE.Vector3(1, 0, 0), -stepY / BALL_RADIUS);
    tempMat.multiply(ballMesh.matrix);
    ballMesh.matrix = tempMat;
    ballMesh.rotation.setFromRotationMatrix(ballMesh.matrix);

    // Update camera and light positions
    camera.position.x += (ballMesh.position.x - camera.position.x) * 0.1;
    camera.position.y += (ballMesh.position.y - camera.position.y) * 0.1;
    camera.position.z += (5 - camera.position.z) * 0.1;
    light.position.x = camera.position.x;
    light.position.y = camera.position.y;
    light.position.z = camera.position.z - 3.7;
}


function gameLoop() {
    switch (gameState) {
    case 'advancing':
        // reset flash matierial color
        flashMesh.material.color.set(utils.colors.rgbToString(yellowColor));
        getFlashColor = utils.colors.transition(yellowColor, redColor, 0.05);
        break;

    case 'initialize':
        maze = generateSquareMaze(mazeDimension);
        maze[mazeDimension - 1][mazeDimension - 2] = false;
        createPhysicsWorld();
        createRenderWorld();
        camera.position.set(1, 1, 5);
        light.position.set(1, 1, 1.3);
        light.intensity = 0;
        var level = Math.floor((mazeDimension - 1) / 2 - 4);
        if (level > currentLevel) {
            advanceLevelTo(level);
            showSplashForLevel(level);
        }
        gameState = 'advancing';
        break;

    case 'fade in':
        light.intensity += 0.1 * (1.0 - light.intensity);
        renderer.render(scene, camera);
        if (Math.abs(light.intensity - 1.0) < 0.05) {
            light.intensity = 1.0;
            gameState = 'play';
        }
        break;

    case 'play':
        updatePhysicsWorld();
        updateRenderWorld();
        renderer.render(scene, camera);
        // Check for victory.
        var mazeX = Math.floor(ballMesh.position.x + 0.5);
        var mazeY = Math.floor(ballMesh.position.y + 0.5);
        if (mazeX == mazeDimension && mazeY == mazeDimension - 2) {
            mazeDimension += 2;
            gameState = 'fade out';
        }
        break;

    case 'fade out':
        if (currentLevel == 4) {
            advanceLevelTo(5);
            gameState = 'end of game';
            break;
        }
        updatePhysicsWorld();
        updateRenderWorld();
        light.intensity += 0.1 * (0.0 - light.intensity);
        renderer.render(scene, camera);
        if (Math.abs(light.intensity - 0.0) < 0.1) {
            light.intensity = 0.0;
            renderer.render(scene, camera);
            gameState = 'initialize';
        }
        break;
            
    case 'end of game':
        // Show end of game animation and menu
        showSplashForLevel();
        break;
    
        case 'idle':
        break;        
    }
    requestAnimationFrame(gameLoop);
}


function flash() {
    // update color 5% more red than before
    var rgb = getFlashColor();
    flashMesh.material.color.set(rgb);
    TweenLite.to(flashMesh.material, 0.15, {
        opacity: 0.30,
        onComplete: function () {
            TweenLite.to(flashMesh.material, 0.15, {
                opacity: 0
            });
        }
    });
}


function advanceLevelTo(level) {
    currentLevel = level;
}


function showSplashForLevel() {
    var animationDelay = currentLevel != 5 ? 3000 : 8000;
    // Hide level name and description hud
    showLevelHud(false);
    showGameCanvas(false);
    // Update splash screen info for level
    updateSplashScreen();
    
    // Update splash screen animation graphic
    // no cache for animations
    if (currentLevel != 1) {
        $splashLevelCompletedGraphic
            .attr('src', 'imgs/level_' + (currentLevel - 1) + '/level_completed.gif?a=' + Math.random())
            .show();
    }
        
    if (currentLevel == 1) {
        $splashScreen.show();
    } else {
        // Start with level complete graphic
        $splashLevelCompleted.show();
        // Shut it down after 3 seconds
        setTimeout(function () {
            $splashLevelCompleted.hide();
            $splashScreen.show();
        }, animationDelay);
    }
    
    // End of game. Show menu for next steps
    if (currentLevel == 5) {
        $splashScreenLevelDetails.hide();
        $splashScreenGameOverMenu.show();
        gameStateDoc.set({isGameOver: true});
        gameState = 'idle';
    } else {
        // End of splash screens. Show game
        setTimeout(function () {
            $splashScreen.hide();
            updateLevelHud();
            showGameCanvas(true);
            showLevelHud(true);
            gameState = 'fade in';
        }, 7000);
    }
}


function updateSplashScreen() {
    $splashScreenTitle.text('CALL ' + currentLevel);
    $splashScreenLevelName.text(levelNames[currentLevel]);
    $splashScreenLevelDescription.text(levelDescriptions[currentLevel]);
}


function updateLevelHud() {
    $level.html('CALL ' + currentLevel).show();
    $levelName.html(levelNames[currentLevel]).show();
}


function showLevelHud(show) {
    if (show) {
        $level.show();
        $levelName.show();
    } else {
        $level.hide();
        $levelName.hide();
    }
}


function showGameCanvas(show) {
    if (show) {
        $gameCanvasDisplay.style.display = 'block';
    } else {
        $gameCanvasDisplay.style.display = 'none';
    }
}


function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
}


// From mobile phone (controller)
function onControllerUpdated(axis) {
    // Check if game is paused
    if (axis.isGamePaused) {
        $pauseScreen.show();
        return;
    } else if (!axis.isGamePaused && $pauseScreen.is(':visible')) {
        $pauseScreen.hide();
    }

    // Push raw data to front of arrays
    // each coordinate gets it's own array
    rawAccelX.unshift(axis.x);
    rawAccelY.unshift(axis.y);
    // Remove oldest data from back of arrays
    rawAccelX.pop();
    rawAccelY.pop();
    // Get new x & y acceleration average
    newAccel = {
        x: getAvgAcceleration(rawAccelX),
        y: getAvgAcceleration(rawAccelY)
    };
    diffAccel = {
        x: Math.abs(oldAccel.x - newAccel.x),
        y: Math.abs(oldAccel.y - newAccel.y)
    };

    if (diffAccel.x <= ACCEL_THRESHOLD) return;
    if (diffAccel.y <= ACCEL_THRESHOLD) return;

    newAxis = [0, 0];
    if (newAccel.x < 0) newAxis[1] = 1;
    if (newAccel.x >= 0) newAxis[1] = -1;
    if (newAccel.y < 0) newAxis[0] = -1;
    if (newAccel.y >= 0) newAxis[0] = 1;

    controllerAxis = newAxis;
    oldAccel.x = newAccel.x;
    oldAccel.y = newAccel.y;
}


function getAvgAcceleration(rawAccel) {
    var accel = 0.0;
    for (var i = 0; i < rawAccel.length; i++) {
        accel += rawAccel[i];
    }
    accel *= ACCEL_FACTOR / NUM_FILTER_POINTS;
    return accel;
}


$(document).ready(function () {
    function getHandles() {
        $mainMenu =  $('#main-menu');
        $startGame = $('#start-game');
        $mainMenuFooter = $('#main-menu-footer');
        $splashScreen = $('#splash-screen');
        $splashScreenLevelDetails = $('#splash-screen-details');
        $splashLevelCompleted = $('#splash-level-completed');
        $splashLevelCompletedGraphic = $('#splash-level-completed-graphic');
        $level = $('#desktop-level');
        $levelName = $('#desktop-level-name');
        $splashScreenTitle = $('#splash-screen-title');
        $splashScreenLevelName = $('#splash-screen-level-name');
        $splashScreenLevelDescription = $('#splash-screen-level-description');
        $splashScreenGameOverMenu = $('#splash-scren-gameover-menu');
        $pauseScreen = $('#pause-screen');
    }

    function initGame() {
        // Get jQuery handles
        getHandles();
        // Hide unncecessary controls in initial state
        $splashScreen.hide();
        $splashLevelCompleted.hide();
        $splashScreenGameOverMenu.hide();
        $level.hide();
        $levelName.hide();
        $pauseScreen.hide();
        $mainMenu.show();
        // Set the initial game state
        gameState = 'waiting for sync'; 
    }
    
    initGame();
    
    // Bind enterkey to trigger click event on phone number field
    $('#txtPhoneNumber').bind('keypress', function (event) {
        if (event.keyCode === 13) {
            $('#btnStart').trigger('click');
        }
    });
    
    function openLinkInNewTab(id) {
        $(id).on('click', function () {
            $(this).target = '_blank';
            window.open($(this).prop('href'));
            return false;
        });
    }
    
    openLinkInNewTab('#btnLearnAbout');  
    openLinkInNewTab('#btnViewSource');    

    $('#btnStart').on('click', function () {
        var phoneNumber = $('#txtPhoneNumber').val();
        if (isValidPhoneNumber(phoneNumber)) {
            var url = '/token/' + phoneNumber;
            Twilio.Sync.CreateClient(url).then(function (client) {
                syncClient = client;
                
                syncClient.document('game-state-' + phoneNumber).then(function (doc) {
                    gameStateDoc = doc;
                    
                    syncClient.document('controller-state-' + phoneNumber).then(function (ctrlDoc) {
                        controllerStateDoc = ctrlDoc;
                        
                        syncClient.list('wall-collision-list-' + phoneNumber).then(function (syncList) {
                            wallCollisionList = syncList

                            // Hide entire menu
                            $mainMenu.hide();
                            $startGame.hide();
                            $mainMenuFooter.hide();
                            
                            // Create the renderer
                            renderer = new THREE.WebGLRenderer();
                            renderer.setSize(window.innerWidth, window.innerHeight);
                            // Set an id for the game canvas
                            renderer.domElement.setAttribute('id', 'game-canvas');
                            // Add canvas to body
                            document.body.appendChild(renderer.domElement);
                            // Get Handle to game canvs to toggle visibility
                            $gameCanvasDisplay = document.getElementById("game-canvas");
                            // Bind keyboard and resize events
                            $(window).resize(onResize);
                            // Start the game loop
                            gameState = 'initialize';
                            requestAnimationFrame(gameLoop);
                            // Subscribe to changes to the controller state document
                            controllerStateDoc.on('updated', function (data) {
                                onControllerUpdated(data);
                            });
                        })
                    });
                });
            });
        }
    });
});
