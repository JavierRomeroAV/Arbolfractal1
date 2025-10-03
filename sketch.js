// Variables globales
let arboles = [];
let bananos = [];
let gotas = [];
let nubes = [];
let canvas;
let truenos = [];
let ultimoTrueno = 0;

// Configuración inicial
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');
  colorMode(HSB, 360, 100, 100, 100);
  
  // Crear árboles fractales
  for (let i = 0; i < 5; i++) {
    let x = random(width * 0.1, width * 0.9);
    arboles.push(new ArbolFractal(x, height, random(height * 0.2, height * 0.3)));
  }
  
  // Crear nubes de lluvia
  for (let i = 0; i < 7; i++) {
    nubes.push(new NubeLluvia(random(width), random(height * 0.05, height * 0.2)));
  }
  
  // Inicializar sistema de gotas de lluvia
  for (let i = 0; i < 300; i++) {
    gotas.push(new Gota(random(width), random(-500, 0)));
  }
}

// Función principal de dibujo
function draw() {
  // Fondo cielo lluvioso con gradiente oscuro
  let gradienteSky = drawingContext.createLinearGradient(0, 0, width, 0);
  gradienteSky.addColorStop(0, color(210, 30, 40)); // Azul oscuro
  gradienteSky.addColorStop(0.5, color(220, 25, 35)); // Azul grisáceo
  gradienteSky.addColorStop(1, color(230, 20, 30)); // Gris azulado
  
  drawingContext.fillStyle = gradienteSky;
  rect(0, 0, width, height);
  
  // Efecto de trueno aleatorio
  if (random(100) < 0.5 && millis() - ultimoTrueno > 5000) {
    truenos.push({
      alpha: 80,
      duracion: random(5, 15)
    });
    ultimoTrueno = millis();
  }
  
  // Dibujar truenos
  for (let i = truenos.length - 1; i >= 0; i--) {
    let trueno = truenos[i];
    // Flash de luz
    fill(60, 10, 100, trueno.alpha);
    rect(0, 0, width, height);
    trueno.alpha -= trueno.duracion;
    if (trueno.alpha <= 0) {
      truenos.splice(i, 1);
    }
  }
  
  // Dibujar nubes
  for (let nube of nubes) {
    nube.actualizar();
    nube.dibujar();
  }
  
  // Dibujar gotas de lluvia
  for (let gota of gotas) {
    gota.actualizar();
    gota.dibujar();
  }
  
  // Dibujar suelo mojado con gradiente
  let gradienteSuelo = drawingContext.createLinearGradient(0, height - 40, width, height - 40);
  gradienteSuelo.addColorStop(0, color(200, 30, 20));
  gradienteSuelo.addColorStop(0.5, color(200, 20, 25));
  gradienteSuelo.addColorStop(1, color(200, 40, 15));
  
  drawingContext.fillStyle = gradienteSuelo;
  rect(0, height - 40, width, 40);
  
  // Reflejos en el suelo
  drawingContext.globalAlpha = 0.2;
  drawingContext.globalCompositeOperation = 'lighter';
  for (let arbol of arboles) {
    push();
    scale(1, -0.2);
    translate(0, -height * 2 + 40);
    arbol.dibujar(true); // Dibujar reflejo
    pop();
  }
  drawingContext.globalAlpha = 1;
  drawingContext.globalCompositeOperation = 'source-over';
  
  // Dibujar árboles
  for (let arbol of arboles) {
    arbol.dibujar(false);
  }
  
  // Actualizar y dibujar bananos
  for (let i = bananos.length - 1; i >= 0; i--) {
    let banano = bananos[i];
    banano.actualizar();
    banano.dibujar();
    
    // Eliminar bananos viejos o que han caído fuera de la pantalla
    if (banano.vida <= 0 || banano.posicion.y > height - 40) {
      bananos.splice(i, 1);
    }
  }
}

// Clase para el árbol fractal
class ArbolFractal {
  constructor(x, y, altura) {
    this.posicion = createVector(x, y);
    this.altura = altura * 1.5;
    this.ancho = this.altura / 10;
    this.color = color(30, 40, 30);
    this.puntosFruto = [];
    this.angulo = PI/6;
    this.reduccion = 0.67;
    this.niveles = 5;
    
    // Generar puntos para los frutos en las puntas de las ramas
    this.calcularPuntosFruto();
  }
  
  calcularPuntosFruto() {
    // Esta función se llamará después de dibujar el árbol para obtener los puntos finales
    this.puntosFruto = [];
    let puntas = [];
    this.obtenerPuntasRamas(this.posicion.x, this.posicion.y, -PI/2, this.altura * 0.7, 0, puntas);
    
    // Seleccionar algunas puntas aleatorias para los frutos
    for (let i = 0; i < min(8, puntas.length); i++) {
      let indice = floor(random(puntas.length));
      if (indice < puntas.length) {
        this.puntosFruto.push(puntas[indice]);
      }
    }
  }
  
  obtenerPuntasRamas(x, y, angulo, longitud, nivel, puntas) {
    // Calcular el punto final de esta rama
    let xFin = x + cos(angulo) * longitud;
    let yFin = y + sin(angulo) * longitud;
    
    // Si es una rama final, añadir a las puntas
    if (nivel === this.niveles - 1) {
      puntas.push({x: xFin, y: yFin});
    } else {
      // Recursión para las ramas hijas
      this.obtenerPuntasRamas(xFin, yFin, angulo - this.angulo, longitud * this.reduccion, nivel + 1, puntas);
      this.obtenerPuntasRamas(xFin, yFin, angulo + this.angulo, longitud * this.reduccion, nivel + 1, puntas);
    }
  }
  
  dibujar(esReflejo = false) {
    push();
    
    if (!esReflejo) {
      // Sombra del árbol solo para el árbol real, no para el reflejo
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = 'rgba(0, 0, 0, 0.3)';
    }
    
    // Color del tronco más oscuro para día lluvioso
    stroke(20, 30, 20);
    strokeWeight(this.ancho);
    
    // Dibujar el árbol fractal recursivamente
    this.dibujarRama(this.posicion.x, this.posicion.y, -PI/2, this.altura * 0.7, 0);
    
    // Puntos de frutos (invisibles)
    noFill();
    noStroke();
    for (let punto of this.puntosFruto) {
      ellipse(punto.x, punto.y, 5, 5);
    }
    
    pop();
  }
  
  dibujarRama(x, y, angulo, longitud, nivel) {
    // Calcular el punto final de esta rama
    let xFin = x + cos(angulo) * longitud;
    let yFin = y + sin(angulo) * longitud;
    
    // Ajustar el grosor según el nivel
    strokeWeight(this.ancho * pow(0.7, nivel));
    
    // Ajustar el color según el nivel
    let tono = map(nivel, 0, this.niveles, 20, 40);
    let saturacion = map(nivel, 0, this.niveles, 30, 50);
    let brillo = map(nivel, 0, this.niveles, 20, 30);
    stroke(tono, saturacion, brillo);
    
    // Dibujar esta rama
    line(x, y, xFin, yFin);
    
    // Si no hemos llegado al nivel máximo, dibujar las ramas hijas
    if (nivel < this.niveles - 1) {
      this.dibujarRama(xFin, yFin, angulo - this.angulo, longitud * this.reduccion, nivel + 1);
      this.dibujarRama(xFin, yFin, angulo + this.angulo, longitud * this.reduccion, nivel + 1);
    }
  }
  
  generarBanano() {
    if (this.puntosFruto.length > 0) {
      // Calcular puntos de fruto si no se ha hecho
      if (this.puntosFruto.length === 0) {
        this.calcularPuntosFruto();
      }
      
      let puntoAleatorio = random(this.puntosFruto);
      bananos.push(new Banano(puntoAleatorio.x, puntoAleatorio.y));
    }
  }
}

// Clase para las gotas de lluvia
class Gota {
  constructor(x, y) {
    this.posicion = createVector(x, y);
    this.velocidad = createVector(random(-0.5, 0.5), random(5, 15));
    this.longitud = random(10, 30);
    this.grosor = random(1, 2);
    this.alpha = random(150, 220);
  }
  
  actualizar() {
    this.posicion.add(this.velocidad);
    
    // Si la gota sale de la pantalla, reiniciarla arriba
    if (this.posicion.y > height) {
      this.posicion.y = random(-100, 0);
      this.posicion.x = random(width);
      this.velocidad.y = random(5, 15);
      this.longitud = random(10, 30);
    }
  }
  
  dibujar() {
    push();
    stroke(220, 10, 90, this.alpha);
    strokeWeight(this.grosor);
    line(
      this.posicion.x, 
      this.posicion.y, 
      this.posicion.x + this.velocidad.x * 0.5, 
      this.posicion.y - this.longitud
    );
    pop();
  }
}

// Clase para las nubes de lluvia
class NubeLluvia {
  constructor(x, y) {
    this.posicion = createVector(x, y);
    this.velocidad = createVector(random(0.3, 1.2), 0);
    this.tamaño = random(100, 250);
    this.color = color(220, 10, 30, 90);
    this.gotasTimer = 0;
  }
  
  actualizar() {
    this.posicion.add(this.velocidad);
    
    // Si la nube sale de la pantalla, vuelve a aparecer por el otro lado
    if (this.posicion.x > width + this.tamaño) {
      this.posicion.x = -this.tamaño;
      this.posicion.y = random(height * 0.05, height * 0.2);
    }
  }
  
  dibujar() {
    push();
    translate(this.posicion.x, this.posicion.y);
    
    // Dibujar nube más oscura para día lluvioso
    fill(this.color);
    noStroke();
    
    // Forma de nube más compleja
    ellipse(0, 0, this.tamaño, this.tamaño * 0.6);
    ellipse(this.tamaño * 0.3, -this.tamaño * 0.1, this.tamaño * 0.7, this.tamaño * 0.5);
    ellipse(-this.tamaño * 0.3, this.tamaño * 0.1, this.tamaño * 0.7, this.tamaño * 0.5);
    ellipse(this.tamaño * 0.5, this.tamaño * 0.05, this.tamaño * 0.6, this.tamaño * 0.4);
    ellipse(-this.tamaño * 0.5, -this.tamaño * 0.05, this.tamaño * 0.6, this.tamaño * 0.4);
    
    pop();
  }
}

// Clase para los bananos
class Banano {
  constructor(x, y) {
    this.posicion = createVector(x, y);
    this.velocidad = createVector(random(-0.5, 0.5), random(-0.2, 0.5));
    this.aceleracion = createVector(0, 0.1);
    this.tamaño = random(15, 25);
    this.rotacion = random(TWO_PI);
    this.velocidadRotacion = random(-0.02, 0.02);
    this.color = color(60, 100, 90); // Amarillo para banano
    this.vida = random(200, 300);
  }
  
  actualizar() {
    // Aplicar física
    this.velocidad.add(this.aceleracion);
    this.posicion.add(this.velocidad);
    
    // Aplicar resistencia del aire
    this.velocidad.mult(0.99);
    
    // Actualizar rotación
    this.rotacion += this.velocidadRotacion;
    
    // Reducir vida
    this.vida--;
  }
  
  dibujar() {
    push();
    translate(this.posicion.x, this.posicion.y);
    rotate(this.rotacion);
    
    // Dibujar banano
    fill(this.color);
    noStroke();
    
    // Forma de banano
    beginShape();
    vertex(0, -this.tamaño/2);
    bezierVertex(this.tamaño/2, -this.tamaño/3, this.tamaño/2, this.tamaño/3, 0, this.tamaño/2);
    bezierVertex(-this.tamaño/2, this.tamaño/3, -this.tamaño/2, -this.tamaño/3, 0, -this.tamaño/2);
    endShape(CLOSE);
    
    // Detalles del banano
    fill(60, 90, 80);
    ellipse(0, 0, this.tamaño * 0.8, this.tamaño * 0.3);
    
    pop();
  }
}

// Clase para el sol
class Sol {
  constructor(x, y) {
    this.posicion = createVector(x, y);
    this.tamaño = min(width, height) * 0.15;
    this.angulo = 0;
    this.color = color(35, 80, 95); // Color más suave
    this.resplandor = 0;
  }
  
  actualizar() {
    this.angulo += 0.005;
    this.resplandor = sin(frameCount * 0.02) * 10; // Efecto de pulsación suave
  }
  
  dibujar() {
    push();
    translate(this.posicion.x, this.posicion.y);
    
    // Resplandor exterior
    drawingContext.shadowBlur = 50 + this.resplandor;
    drawingContext.shadowColor = color(35, 90, 100, 70);
    
    // Gradiente de sol
    let gradiente = drawingContext.createRadialGradient(0, 0, 0, 0, 0, this.tamaño/2);
    gradiente.addColorStop(0, color(40, 80, 100, 100));
    gradiente.addColorStop(0.7, color(35, 90, 95, 100));
    gradiente.addColorStop(1, color(30, 100, 90, 90));
    
    drawingContext.fillStyle = gradiente;
    
    // Sol
    noStroke();
    ellipse(0, 0, this.tamaño + this.resplandor, this.tamaño + this.resplandor);
    
    // Rayos de sol sutiles
    drawingContext.shadowBlur = 0;
    fill(40, 80, 100, 20);
    for (let i = 0; i < 8; i++) {
      push();
      rotate(this.angulo + i * TWO_PI / 8);
      let rayoLongitud = this.tamaño * 1.2;
      let rayoAncho = map(sin(frameCount * 0.05 + i), -1, 1, 0.1, 0.2);
      ellipse(rayoLongitud/2, 0, rayoLongitud, rayoLongitud * rayoAncho);
      pop();
    }
    
    pop();
  }
}

// Clase para las nubes
class Nube {
  constructor(x, y) {
    this.posicion = createVector(x, y);
    this.velocidad = createVector(random(0.2, 0.8), 0);
    this.tamaño = random(50, 150);
    this.color = color(0, 0, 100, 80);
  }
  
  actualizar() {
    this.posicion.add(this.velocidad);
    
    // Si la nube sale de la pantalla, vuelve a aparecer por el otro lado
    if (this.posicion.x > width + this.tamaño) {
      this.posicion.x = -this.tamaño;
      this.posicion.y = random(height * 0.1, height * 0.3);
    }
  }
  
  dibujar() {
    push();
    translate(this.posicion.x, this.posicion.y);
    
    // Dibujar nube
    fill(this.color);
    noStroke();
    ellipse(0, 0, this.tamaño, this.tamaño * 0.6);
    ellipse(this.tamaño * 0.3, -this.tamaño * 0.1, this.tamaño * 0.7, this.tamaño * 0.5);
    ellipse(-this.tamaño * 0.3, this.tamaño * 0.1, this.tamaño * 0.7, this.tamaño * 0.5);
    
    pop();
  }
}

// Clase para los pájaros
class Pajaro {
  constructor(x, y) {
    this.posicion = createVector(x, y);
    this.velocidad = createVector(random(1, 3) * (random() > 0.5 ? 1 : -1), 0);
    this.tamaño = random(10, 20);
    this.color = color(random(0, 360), 80, 30);
    this.aleteo = 0;
    this.velocidadAleteo = random(0.1, 0.3);
  }
  
  actualizar() {
    this.posicion.add(this.velocidad);
    this.aleteo += this.velocidadAleteo;
    
    // Si el pájaro sale de la pantalla, vuelve a aparecer por el otro lado
    if (this.posicion.x > width + this.tamaño) {
      this.posicion.x = -this.tamaño;
      this.posicion.y = random(height * 0.2, height * 0.5);
    } else if (this.posicion.x < -this.tamaño) {
      this.posicion.x = width + this.tamaño;
      this.posicion.y = random(height * 0.2, height * 0.5);
    }
  }
  
  dibujar() {
    push();
    translate(this.posicion.x, this.posicion.y);
    
    // Orientar el pájaro según su dirección
    if (this.velocidad.x < 0) {
      scale(-1, 1);
    }
    
    // Dibujar pájaro
    fill(this.color);
    noStroke();
    
    // Alas
    let alaSuperior = map(sin(this.aleteo), -1, 1, -this.tamaño * 0.5, -this.tamaño * 0.2);
    triangle(0, 0, this.tamaño, alaSuperior, this.tamaño * 0.5, 0);
    
    // Cuerpo y cabeza
    ellipse(0, 0, this.tamaño * 1.5, this.tamaño * 0.8);
    ellipse(-this.tamaño * 0.6, -this.tamaño * 0.2, this.tamaño * 0.7, this.tamaño * 0.7);
    
    // Pico
    fill(40, 100, 100);
    triangle(-this.tamaño * 0.9, -this.tamaño * 0.2, -this.tamaño * 1.2, -this.tamaño * 0.1, -this.tamaño * 0.9, 0);
    
    pop();
  }
}

// Función para detectar clics y generar bananos
function mousePressed() {
  // Generar bananos en todos los árboles
  for (let arbol of arboles) {
    for (let i = 0; i < 3; i++) {
      arbol.generarBanano();
    }
  }
  
  // Añadir efecto de trueno al hacer clic
  truenos.push({
    alpha: 100,
    duracion: 8
  });
  ultimoTrueno = millis();
}

// Ajustar el tamaño del canvas cuando cambia el tamaño de la ventana
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Reposicionar el sol
  sol.posicion.x = width * 0.8;
  sol.posicion.y = height * 0.2;
  sol.tamaño = min(width, height) * 0.15;
}