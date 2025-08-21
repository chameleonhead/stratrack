#property indicator_separate_window
#property indicator_buffers 3

double MacdBuffer[];
double SignalBuffer[];
double HistBuffer[];

input int FastEMA=12;
input int SlowEMA=26;
input int SignalSMA=9;

int OnInit(){
   IndicatorBuffers(3);
   SetIndexBuffer(0,MacdBuffer);
   SetIndexBuffer(1,SignalBuffer);
   SetIndexBuffer(2,HistBuffer);
   IndicatorShortName("CustomMACD");
   return(INIT_SUCCEEDED);
}

int OnCalculate(){
   int i;
   for(i=0;i<Bars;i++){
      MacdBuffer[i]=iMACD(NULL,0,FastEMA,SlowEMA,SignalSMA,0,0,i);
      SignalBuffer[i]=iMACD(NULL,0,FastEMA,SlowEMA,SignalSMA,0,1,i);
      HistBuffer[i]=iMACD(NULL,0,FastEMA,SlowEMA,SignalSMA,0,2,i);
   }
   return(Bars);
}
