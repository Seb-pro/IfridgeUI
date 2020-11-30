import axios, {
  AxiosError
} from "../../node_modules/axios/index"

interface IGrocery{
  "barcode": number,
  "wareName": string,
  "category": string,
  "expiration": number,
  "weight": number,
  "picture": string
  
}

let baseUrl = 'https://ifridgeapi.azurewebsites.net/api/Waretypes';

new Vue({
  el: "#app",
  data: {
      groceries: [],
      formData: {barcode: undefined, wareName: "", categori: "", expiration: undefined, weight: undefined, picture: "" },
      currentSort:'expiration',
      currentSortDir:'asc',
      
  },
  methods: {
        
               
        async add(){
          axios.post<IGrocery>(baseUrl, this.formData)
      },
    
     async showPic(){
      if (groeries.experiation <2) {
        
      }
     }, 

      async getAllGroceriesAsync() {
          try { return axios.get<IGrocery[]>(baseUrl) }
          catch (error: AxiosError) {
              this.message = error.message;
              alert(error.message)
          }
      },

      async getAllGroceries() {
          let response = await this.getAllGroceriesAsync();
          this.groceries = response.data;
      },

      clearList() {
          this.groceries = [];
      },

      sort:function(s) {
          //if s == current sort, reverse
          if(s === this.currentSort) {
            this.currentSortDir = this.currentSortDir==='asc'?'desc':'asc';
          }
          this.currentSort = s;
        },
      
  },

  computed:{
      sortedGroceries:function() {
        return this.groceries.sort((a,b) => {
          let modifier = 1;
          if(this.currentSortDir === 'desc') modifier = -1;
          if(a[this.currentSort] < b[this.currentSort]) return -1 * modifier;
          if(a[this.currentSort] > b[this.currentSort]) return 1 * modifier;
          return 0;
        });
      }
    }
})
