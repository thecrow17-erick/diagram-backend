import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/services';

@WebSocketGateway({
  cors: {
    origin: '*', // Ajusta según tus necesidades de CORS
  },
})
export class CanvasGateway implements OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer()
  server: Server;

  private canvasStates  = new Map<string,JSON>

  constructor(private prismaService: PrismaService){}

  public async handleConnection(client: Socket) {
    console.log("Cliente connect: ", client.id);
  }

  public async handleDisconnect(client: Socket) {
    console.log("Cliente disconnect: ",client.id);
  }


  
  @SubscribeMessage("joinRoom")
  public async handleJoinRoom(client: Socket, roomCode: string){
    client.join(roomCode);
    //enviar el estado actual del canvas
    let canva;
    const room = await this.prismaService.room.findFirst({
      where: {code: roomCode}
    });
    if(room){
      canva = room.data.toString();
    }else if(this.canvasStates.get(roomCode)){
      canva = this.canvasStates.get(roomCode)
    }else {
      canva = '[]';
    }
    client.emit('canvasState', canva);
  }

  @SubscribeMessage('canvasUpdate')
  async handleCanvasUpdate(client: Socket, payload: { roomCode: string; data: any }) {
    // Transmitir a todos los clientes en la misma sala excepto al emisor
    this.canvasStates.set(payload.roomCode, payload.data);
    client.to(payload.roomCode).emit('canvasUpdate', payload.data);
  }
}
