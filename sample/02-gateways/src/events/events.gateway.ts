import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  OnGatewayConnection,
  ConnectedSocket
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(@ConnectedSocket() socket: Socket, ...args: any[]) {
      console.log('someone is conntecting', socket.broadcast.allSockets());
      socket.emit('events', {data: 'is connecting'});
      
  }

  @SubscribeMessage('events')
  findAll(@MessageBody("me") me: string): Observable<WsResponse<string>> {
    console.log(me);
    return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: `me${item}`})));
  }


  @SubscribeMessage('joinroom')
  joinRoom(@ConnectedSocket() client: Socket, @MessageBody('room') roomId?: string){

    let _socketRoomId = roomId ? roomId : 'aRandomRoomId';
    client.join(_socketRoomId);
    
    let _castMsg = `${client.id} join room: ${_socketRoomId}`;
    client.to(_socketRoomId).emit('joinroom', _castMsg);

    console.log(client.rooms);
    return _castMsg;
  }
}
