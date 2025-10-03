// Variables globales
let arboles = [];
let bananos = [];
let pajaros = [];
let sol;
let nubes = [];
let canvas;

// Configuración inicial
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  
  // Crear árboles
  for (let i = 0; i < 5; i++) {
    let x = random(width * 0.1, width * 0.9);
    arboles.push(new Arbol(x, height, random(80, 120)));
  }
  
  // Crear sol
  sol = new Sol(width * 0.8, height * 0.2);
  
  // Crear nubes
  for (let i = 0; i < 3; i++) {
    nubes.push(new Nube(random(width), random(height * 0.1, height * 0.3)));
  }
  
  // Crear pájaros
  for (let i = 0; i < 8; i++) {
    pajaros.push(new Pajaro(random(width), random(height * 0.2, height * 0.5)));
  }
}

// Función principal de dibujo
function draw() {
  // Fondo cielo
  background(200, 70, 90); // Azul cielo
  
  // Dibujar sol
  sol.actualizar();
  sol.dibujar();
  
  // Dibujar nubes
  for (let nube of nubes) {
    nube.actualizar();
    nube.dibujar();
  }
  
  // Dibujar pájaros
  for (let pajaro of pajaros) {
    pajaro.actualizar();
    pajaro.dibujar();
  }
  
  // Dibujar suelo
  fill(120, 70, 60);
  rect(0, height - 20, width, 20);
  
  // Dibujar árboles
  for (let arbol of arboles) {
    arbol.dibujar();
  }
  
  // Actualizar y dibujar bananos
  for (let i = bananos.length - 1; i >= 0; i--) {
    let banano = bananos[i];
    banano.actualizar();
    banano.dibujar();
    
    // Eliminar bananos viejos o que han caído fuera de la pantalla
    if (banano.vida <= 0 || banano.posicion.y > height - 20) {
      bananos.splice(i, 1);
    }
  }
}

// Clase para el árbol
class Arbol {
  constructor(x, y, altura) {
    this.posicion = createVector(x, y);
    this.altura = altura;
    this.ancho = altura / 5;
    this.color = color(30, 80, 40);
    this.puntosFruto = [];
    
    // Generar puntos para los frutos
    let numPuntos = floor(random(3, 6));
    for (let i = 0; i < numPuntos; i++) {
      this.puntosFruto.push({
        x: this.posicion.x + random(-this.ancho, this.ancho),
        y: this.posicion.y - this.altura * random(0.5, 0.9)
      });
    }
  }
  
  dibujar() {
    push();
    // Tronco
    fill(30, 60, 40);
    noStroke();
    rect(this.posicion.x - this.ancho/2, this.posicion.y - this.altura, this.ancho, this.altura);
    
    // Copa del árbol
    fill(120, 80, 40);
    ellipse(this.posicion.x, this.posicion.y - this.altura, this.altura, this.altura * 0.8);
    
    // Puntos de frutos (para referencia visual)
    fill(60, 100, 100, 30);
    for (let punto of this.puntosFruto) {
      ellipse(punto.x, punto.y, 10, 10);
    }
    pop();
  }
  
  generarBanano() {
    if (this.puntosFruto.length > 0) {
      let puntoAleatorio = random(this.puntosFruto);
      bananos.push(new Banano(puntoAleatorio.x, puntoAleatorio.y));
    }
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
    this.color = color(40, 100, 100);
  }
  
  actualizar() {
    this.angulo += 0.01;
  }
  
  dibujar() {
    push();
    translate(this.posicion.x, this.posicion.y);
    
    // Rayos de sol
    fill(40, 100, 100, 30);
    for (let i = 0; i < 12; i++) {
      push();
      rotate(this.angulo + i * TWO_PI / 12);
      let rayoLongitud = this.tamaño * 0.8;
      triangle(0, 0, rayoLongitud * 0.3, rayoLongitud, -rayoLongitud * 0.3, rayoLongitud);
      pop();
    }
    
    // Sol
    fill(this.color);
    noStroke();
    ellipse(0, 0, this.tamaño, this.tamaño);
    
    // Cara del sol
    fill(40, 60, 100);
    ellipse(-this.tamaño * 0.2, -this.tamaño * 0.1, this.tamaño * 0.15, this.tamaño * 0.15); // Ojo izquierdo
    ellipse(this.tamaño * 0.2, -this.tamaño * 0.1, this.tamaño * 0.15, this.tamaño * 0.15); // Ojo derecho
    
    // Sonrisa
    noFill();
    stroke(40, 60, 100);
    strokeWeight(this.tamaño * 0.05);
    arc(0, this.tamaño * 0.1, this.tamaño * 0.5, this.tamaño * 0.3, 0, PI);
    
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
}

// Ajustar el tamaño del canvas cuando cambia el tamaño de la ventana
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Reposicionar el sol
  sol.posicion.x = width * 0.8;
  sol.posicion.y = height * 0.2;
  sol.tamaño = min(width, height) * 0.15;
}