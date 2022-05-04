import 'dotenv/config';
import { CronJob } from 'cron';
import {api} from './services/api.js';

import {verifyOrder} from './verifyMovements.js';
import {checkBilleds} from './checkBilled.js';

async function initial ()  {
  let date = new Date();

  console.log('Processo iniciado '+ 
   String(date.getHours()).padStart(2,'0')
   +':'+
   String(date.getMinutes()).padStart(2,'0')
   +' '+
   String(date.getDate()).padStart(2,'0')
   +'/'+
   String(date.getMonth()+1).padStart(2,'0')
  );

  const billedOrders = await checkBilleds(); 

  const data = billedOrders.map(async({order})=>{
    return await verifyOrder(order);
  });

  const orders = await Promise.all(data);

  orders.map(async(item)=>{
    if(!item.PENDENCY){
      try {
        console.log(api);
        console.log(item.NROORD)
        await api.post('/finalized',{
          "order": item.NROORD,
          "user": `${process.env.USER_AUTO_ID}`
        });
        
      } catch (error) {
        console.log(error);
      }
    }
    
  });

}

let job = new CronJob(`*/${process.env.CRON_MINUTE} * * * *`, initial, null ,true, `${process.env.CRON_LOCALE}`);

job.start();
