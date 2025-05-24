import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';

/**
 * Servicio encargado de gestionar eventos en tiempo real usando WebSockets.
 * Este servicio permite emitir eventos a los clientes conectados.
 */
class EventService {
  private io: SocketIOServer | null = null;

  /**
   * Inicializa el servicio de eventos con un servidor HTTP.
   * @param server - El servidor HTTP de la aplicación
   */
  initialize(server: Server): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      path: '/events'
    });

    this.setupEventHandlers();
  }

  /**
   * Configura los manejadores de eventos para las conexiones de WebSockets.
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    // Namespace para eventos relacionados con pricings
    const pricingsNamespace = this.io.of('/pricings');

    pricingsNamespace.on('connection', (socket) => {
      console.log(`New client connected to pricing events: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`Client disconnected from pricing events: ${socket.id}`);
      });
    });
  }

  /**
   * Emite un evento de cambio de pricing a todos los clientes conectados.
   * @param serviceName - Nombre del servicio al que pertenece el pricing
   * @param pricingVersion - Versión del pricing que ha cambiado
   */
  emitPricingChange(serviceName: string, pricingVersion: string): void {
    if (!this.io) {
      console.error('El servidor de eventos no está inicializado');
      return;
    }

    this.io.of('/pricings').emit('message', {
      code: 'PRICING_CHANGE',
      details: {
        serviceName,
        pricingVersion
      }
    });
  }
}

export default EventService;
