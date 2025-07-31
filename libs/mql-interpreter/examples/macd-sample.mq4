#property strict
#define OP_BUY 0
#define OP_SELL 1
#define SELECT_BY_TICKET 0
#define SELECT_BY_POS 1
#define MODE_TRADES 0

input double Lots=0.1;

void OnTick(){
   double macd=iMACD(NULL,0,12,26,9,PRICE_CLOSE,MODE_MAIN,0);
   double signal=iMACD(NULL,0,12,26,9,PRICE_CLOSE,MODE_SIGNAL,0);
   double ma=iMA(NULL,0,26,0,MODE_EMA,PRICE_CLOSE,0);
   double maPrev=iMA(NULL,0,26,0,MODE_EMA,PRICE_CLOSE,1);
   if(OrdersTotal()==0){
      if(macd>signal && ma>maPrev) OrderSend(Symbol(),OP_BUY,Lots,Ask,3,0,0);
      if(macd<signal && ma<maPrev) OrderSend(Symbol(),OP_SELL,Lots,Bid,3,0,0);
   } else {
      for(int i=0;i<OrdersTotal();i++){
         if(!OrderSelect(i,SELECT_BY_POS,MODE_TRADES)) continue;
         if(OrderType()==OP_BUY && macd<signal) OrderClose(OrderTicket(),OrderLots(),Bid);
         if(OrderType()==OP_SELL && macd>signal) OrderClose(OrderTicket(),OrderLots(),Ask);
      }
   }
}
