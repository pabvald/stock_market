import { Component, OnInit } from '@angular/core';
import { Price } from 'src/app/models/price';
import {DataService} from 'src/app/services/data';
import {StateService} from 'src/app/services/state';
import { ActivatedRoute } from "@angular/router";
import {ChallengeUser} from "src/app/models/challenge";

declare let fc: any;


interface UsuarioReto{ 
  nombre:string,
  variacion:number,
  beneficio:number
}

@Component({
  selector: 'app-retos',
  templateUrl: './retos.component.html',
  styleUrls: ['./retos.component.css']
})
export class RetosComponent implements OnInit {

  participantes : UsuarioReto[];
  cName:string;
  cDescription:string;
  cEndDate:Date;
  creator:string;
  searched_username : string;
  data: Price[] = fc.randomFinancial()(50);
  id:number;

  constructor(private dataS:DataService,private route: ActivatedRoute, private state:StateService) {
    this.participantes = [];
    this.searched_username = "";
    this.id = parseInt(this.route.snapshot.paramMap.get("id"));
    this.dataS.getChallengeUsers(this.id).subscribe((data)=>this.setParticipantes(data));

    this.dataS.getChallengeInfo(this.id).subscribe((data)=>{
      this.cDescription = data.descripcion;
      this.cName = data.nombre;
      this.creator = data.creador;
      this.cEndDate = data.fechafin;
    })
   }


  get nickname(){
    return this.state.nickname;
  }
  
  ngOnInit() {
  }

  setParticipantes(participantes:ChallengeUser[]){
    this.participantes = [];
    for(let i=0;i<participantes.length;i++){
      let p = participantes[i];
      this.participantes.push({nombre:p.nickname,beneficio:p.balanceFinal-p.balanceInicial,variacion:p.balanceFinal/p.balanceInicial});
    }

    this.participantes.sort((a,b)=>a.variacion>b.variacion ? -1 : 1);
  }

  getUserPosition(user:UsuarioReto){
    return this.participantes.indexOf(user)+1;
  }

  getSelectedUsers(){
      if(this.searched_username.trim())
        return this.participantes.filter(user => user.nombre.toLowerCase().includes(this.searched_username.trim().toLowerCase()));
      else
        return this.participantes;
  }

  join(){
    let req = this.dataS.addUserToChallenge(this.id);
    req.subscribe((_)=>this.dataS.getChallengeUsers(this.id).subscribe((data)=>this.setParticipantes(data)))
    
  }

  isParticipante(){
    for(let i=0;i<this.participantes.length;i++){
      if(this.participantes[0].nombre==this.nickname)
        return true;
    }
    return false;
  }

  leave(){
    let req = this.dataS.removeUserFromChallenge(this.id);
    req.subscribe((_)=>this.dataS.getChallengeUsers(this.id).subscribe((data)=>this.setParticipantes(data)))
  }

  hasEnded():boolean{
    return new Date() > this.cEndDate;
  }
}
