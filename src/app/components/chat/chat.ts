import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiscalStateService } from '../../fiscal-state.service';

interface Mensaje {
  remitente: 'usuario' | 'ia';
  texto: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat {
  mensajeUsuario: string = '';
  mensajes: Mensaje[] = [
    { remitente: 'ia', texto: '¡Hola! Soy tu Asistente Pedagógico del SENIAT. ¿En qué concepto fiscal te gustaría profundizar hoy?' }
  ];

  temaActivo: string = '';
  pasoSimulacion: number = 0;
  estaEscribiendo: boolean = false; // Indicador de que la IA está pensando

  constructor(private fiscalState: FiscalStateService) {}

  usarSugerencia(pregunta: string) {
    this.mensajeUsuario = pregunta;
    this.enviarMensaje();
  }

  enviarMensaje() {
    if (!this.mensajeUsuario.trim()) return;

    const textoPregunta = this.mensajeUsuario;
    this.mensajes.push({ remitente: 'usuario', texto: textoPregunta });
    this.mensajeUsuario = '';

    // Activamos la animación de "pensando..."
    this.estaEscribiendo = true;

    setTimeout(() => {
      let respuestaIA = '';
      const textoLower = textoPregunta.toLowerCase().trim();
      const esAfirmativo = ['si', 'sí', 'claro', 'por favor', 'dale', 'ok', 'está bien'].includes(textoLower);

      // Si el usuario pregunta por otro tema, interrumpimos la simulación actual
      if (textoLower.includes('desgravamen') || textoLower.includes('tarifa') || textoLower.includes('tramo') || 
          textoLower.includes('plazo') || textoLower.includes('fecha') || textoLower.includes('cargas') || 
          textoLower.includes('familiar') || textoLower.includes('exencion') || textoLower.includes('exención') || 
          textoLower.includes('enriquecimiento')) {
        
        this.temaActivo = '';
        this.pasoSimulacion = 0;
      }

      // Módulo de simulación (Caso práctico principal)
      if (textoLower.includes('simulacion') || textoLower.includes('simulación') || textoLower.includes('caso') || textoLower.includes('ejercicio')) {
        this.temaActivo = 'simulacion';
        this.pasoSimulacion = 1;
        respuestaIA = '¡Perfecto! Vamos con un caso práctico: Supongamos que un contribuyente persona natural obtuvo un enriquecimiento neto anual de 2.500 U.T. ¿En qué tramo de la tarifa del artículo 52 se ubica y cuál es el porcentaje aplicable? ¡Intenta responder!';
      }
      else if (this.temaActivo === 'simulacion') {
        if (this.pasoSimulacion === 1) {
          // Si responde correctamente
          if (textoLower.includes('3') || textoLower.includes('tercer') || textoLower.includes('16') || textoLower.includes('cuarto')) {
            this.fiscalState.setMontoCalculadora(2500); 
            this.pasoSimulacion = 0;
            this.temaActivo = '';
            respuestaIA = '¡Excelente respuesta! Exactamente, cae en el tramo correspondiente. He enviado automáticamente las 2.500 U.T. a la calculadora de la izquierda para que veas el cálculo reflejado al instante.';
          } 
          // Si no sabe, pide pista o resultado
          else if (textoLower.includes('no sé') || textoLower.includes('no se') || textoLower.includes('dime') || textoLower.includes('resultado') || textoLower.includes('ayuda') || textoLower.includes('cual es')) {
            this.fiscalState.setMontoCalculadora(2500); // Manda el monto igual de forma pedagógica
            this.pasoSimulacion = 0;
            this.temaActivo = '';
            respuestaIA = 'No te preocupes, para eso estamos aprendiendo. Con un enriquecimiento de 2.500 U.T., se ubica en el cuarto tramo (16%). He enviado las 2.500 U.T. a la calculadora para que veas cómo se procesa el impuesto.';
          } 
          else {
            respuestaIA = 'Casi lo tienes. Con 2.500 U.T., el impuesto se ubica en la escala del artículo 52. Si prefieres que te dé la respuesta, escribe "dime el resultado".';
          }
        }
      }
      // Temas fiscales generales
      else if (textoLower.includes('desgravamen')) {
        this.temaActivo = 'desgravamen';
        respuestaIA = 'Los desgravámenes son deducciones que la ley permite restar de tus enriquecimientos netos. Pueden ser "Únicos" (775 U.T. fijos) o "Detallados" (gastos médicos, educativos, etc., debidamente soportados con facturas).';
      } 
      else if (textoLower.includes('tarifa') || textoLower.includes('tramo')) {
        this.temaActivo = 'tarifa';
        respuestaIA = 'El impuesto en Venezuela se calcula mediante una escala progresiva de 8 tramos que van desde el 6% hasta el 34% según el artículo 52 de la Ley de ISLR.';
      }
      else if (textoLower.includes('plazo') || textoLower.includes('fecha')) {
        this.temaActivo = 'plazo';
        respuestaIA = 'Las personas naturales deben declarar y pagar su ISLR dentro de los 3 meses siguientes al cierre del ejercicio fiscal (del 1 de enero al 31 de marzo de cada año) ante el portal del SENIAT.';
      }
      else if (textoLower.includes('cargas') || textoLower.includes('familiar')) {
        this.temaActivo = 'cargas';
        respuestaIA = 'Por cada carga familiar (hijos menores o ascendientes directos a tu cargo bajo residencia en el país), la ley otorga una rebaja de 10 U.T. directamente al impuesto final calculado. Además, cuentas con una rebaja personal fija de 10 U.T.';
      }
      else if (textoLower.includes('exencion') || textoLower.includes('exención') || textoLower.includes('extension')) {
        this.temaActivo = 'exencion';
        respuestaIA = 'Las exenciones están dispuestas por la ley para liberar del pago de impuestos a enriquecimientos específicos, como las indemnizaciones laborales por accidentes o ciertos donativos benéficos.';
      }
      else if (textoLower.includes('enriquecimiento') || textoLower.includes('ejercicio')) {
        this.temaActivo = 'enriquecimiento';
        respuestaIA = 'El enriquecimiento neto es el incremento patrimonial que resulta de restar a los ingresos brutos los costos y deducciones permitidas por la ley.';
      }
      else {
        respuestaIA = 'Entiendo tu consulta. Para darte la mejor orientación pedagógica sobre el SENIAT, te sugiero escribir "Hazme una simulación" o preguntar sobre desgravámenes, tarifas, plazos o cargas familiares.';
      }

      // Desactivamos el indicador y agregamos la respuesta rápidamente
      this.estaEscribiendo = false;
      this.mensajes.push({ remitente: 'ia', texto: respuestaIA });
    }, 250);
  }
}