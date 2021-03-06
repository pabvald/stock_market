import { Component, ChangeDetectorRef, OnInit, NgZone } from "@angular/core";
import { Price } from 'src/app/models/price';
import { Company } from 'src/app/models/company';
import { Action } from 'src/app/models/action';
import { DataService } from 'src/app/services/data';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StateService } from 'src/app/services/state';
declare let fc: any;

@Component({
    selector: "portfolio-user",
    templateUrl: "portfolio.html",
    styleUrls: ["portfolio.css"]
})
export class PortfolioComponent implements OnInit {
    nickname: string;
    company: Company;
    numSellActions: number;

    companies: Company[] = [];

    history: Action[];

    price: Price[] = null;

    user: any = null;

    ngOnInit(){
        this.update();
        setInterval(()=>{
            this.update();
        },1000*60);
        // MOSTRAR GRAFICOS
        // CALCULAR BENEFICIOS
        // FORMATO DECIMALES
        // ACTUALIZAR INFO GENERICA
        // LOGIN
        // Pasos instalación
    }

    update(){
        this.data.getPortfolioSummary(this.state.nickname).subscribe((data)=>this.updatePortfolio(data));
        this.data.getPortfolioHistory(this.state.nickname).subscribe((data)=>this.updateHistory(data));
        this.data.getUserInfo(this.state.nickname).subscribe((data)=>{this.updateUserInfo(data)});
    }

    constructor(private data: DataService, private state: StateService){
        this.nickname = state.nickname;
    }

    updatePortfolio(portfolio: Company[]){
        console.log(portfolio);
        this.companies = portfolio;
        this.companies.sort((a,b) =>{
            if(a.name < b.name) return -1;
            if(a.name > b.name) return 1;
            return 0;
        });
    }

    updateHistory(history: Action[]){
        this.history = history.map((h)=>{
            if(h.action == "buy"){
                h.action = "Compra";
            }else if(h.action == "sell"){
                h.action = "Venta";
            }
            return h;
        });
    }

    updateUserInfo(data: any){
        this.user=data;
    }

    show(c: Company){
        this.company=c;
        this.data.getPriceEvolution(c.code).subscribe((price)=>{
            console.log(fc.randomFinancial()(50));
            console.log(price);
            this.price = price;
        });
        //this.price = fc.randomFinancial()(50);
    }

    sell(){
        if(this.numSellActions < 1 && this.numSellActions > this.company.quantity){
            return;
        }
        let data = {
            id: this.company.id,
            quantity: this.numSellActions
        };
        this.data.sellActions(data).subscribe((text)=>{
            if(text.ok){
                this.update();
                alert("La venta se ha realizado correctamente.")
            }else{
                alert("Hubo un problema con la petición");
            }
        })
    }
}