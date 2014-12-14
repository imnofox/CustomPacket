var CustomPacket = (function(){
    /**
     * @file   CustomPacket.js
     * @date   2014-11-03
     * @author ChalkPE
     * @brief  블럭런쳐에서 실행되는 CustomPacket의 클라이언트입니다.
     */
    
    "use strict";
    
    var PORT  = 19131; ///< 통신에 사용할 포트. PE의 기본 포트가 19132이므로 19131을 채택했습니다.
    var DEBUG = true; ///< 디버그 모드. true이면 디버깅 메세지가 출력됩니다.
    
    var channel; ///< 소켓 통신에 쓰이는 객체입니다.
    var decoder = java.nio.charset.Charset.forName("UTF-8").newDecoder(); ///< 바이트버퍼를 UTF-8로 디코딩해주는 객체입니다.
    
    try{
        channel = java.nio.channels.DatagramChannel.open();
    }catch(e){
        debug(e.name + " - " + e.message, true);
    }
    
    /**
     * @brief  디버깅 메세지를 출력합니다.
     * @param  message 출력할 메세지
     * @param  force   디버그 모드가 아닐 때의 출력 여부 - 생략 가능
     * @return 없음
     */
    function debug(message, force){
        if(DEBUG || force) print(message);
    }
    
    /**
     * @brief  소켓을 닫습니다.
     * @return 없음
     */
    function finalize(){
        if(channel !== null){
            channel.close();
            channel = null;
        }
    }
    
    /**
     * @brief  서버에 연결해 통신을 합니다. 예외는 내부에서 처리합니다.
     * @param  str  보내는 문자열
     * @param  hook 서버가 응답한 내용을 전달받을 함수
     * @param  ip   서버의 IP 문자열
     * @param  port 서버의 포트 번호 - 생략 가능, 기본값은 PORT
     * @return 없음
     */
    function connect(str, hook, ip, port){
        new java.lang.Thread({run: function(){
            
            if(channel === null){
                throw new Error("channel is not initialized");
            }
            
            port = port || PORT;
            
            try{
                var remoteAddress = new java.net.InetSocketAddress(ip, port);
                var sendBuffer = java.nio.ByteBuffer.wrap(new java.lang.String(str).getBytes("UTF-8"));
                var sentBytes = channel.send(sendBuffer, remoteAddress);
                
                debug("I SUCCESSFULLY SENT " + sentBytes + " BYTES TO " + remoteAddress.toString() + "!");
                
                var receiveBuffer = java.nio.ByteBuffer.allocateDirect(65507);
                channel.receive(receiveBuffer);
                
                receiveBuffer.flip();
                var read = decoder.decode(receiveBuffer).toString() + "";
                receiveBuffer.clear();
                
                debug("I RECIEVED FROM SERVER! NOW CALLING HOOK...");
                
                hook(read);
            }catch(e){
                debug(e.name + " - " + e.message, true);
            }
        }}).start();
    }
    
    return {
    	connect: connect,
        finalize: finalize
    };
}());