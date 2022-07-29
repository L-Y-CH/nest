import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  OnGatewayConnection,
  ConnectedSocket,
  OnGatewayInit
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BroadcastOperator, Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private ballList = [1,2,3,4,5,6,7,8,9,10];
  private pushStack = [];

  
  afterInit(server: any) {}

  handleConnection(@ConnectedSocket() socket: Socket, ...args: any[]) {
    socket.emit('meconnectserver', socket.id);
      this.server.emit('meconnect',socket.id);
      console.log('someone is conntecting', this.server.allSockets());
  }

  @SubscribeMessage('events')
  findAll(@MessageBody("me") me: string): Observable<WsResponse<string>> {
    console.log(me);
    return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: `me${item}`})));
  }


  @SubscribeMessage('joinroom')
  joinRoom(@ConnectedSocket() client: Socket, @MessageBody('room') roomId: string = "aRandomRoomId") {

    let myRoom = this.server.to(roomId);
    client.join(roomId);

    myRoom.allSockets().then((members) => {
      myRoom.emit('joinroom', `${client.id} join the room ${roomId}, now we have ${members.size} member(s)`);
    });

  }

  @SubscribeMessage('pushball')
  pushBall(@ConnectedSocket() client: Socket, @MessageBody('ball') ballNum: number){
    
    let myRooms = client.rooms.values();
    myRooms.next();
    let roomId: string = myRooms.next().value;
    let myRoom = this.server.to(roomId);

    this.ballList.unshift(ballNum);
    myRoom.emit('ballpushed', this.ballList);
  }
}
