import axios, {
  AxiosError, AxiosResponse
} from "../../node_modules/axios/index"

interface IGrocery{
  productInstanceId: number,
  ownerId: number,
  barcode: number,
  product: {
    barcode: number,
    subCategoryId: number,
    subCategory: {
      subCategoryId: number,
      categoryId: number,
      category: {
        categoryId: number,
        categoryName: string
      },
      subCategoryName: string,
      isFluid: true
    },
    productName: string,
    expiration: number,
    weight: number,
    picture: string
  },
  dateAdded: VarDate
  
}

let baseUrl = 'https://ifridgeapi.azurewebsites.net/api/ProductInstances';

new Vue({
  el: "#app",
  data: {
      groceries: [],
      formData: {productInstanceId: 0, barcode: undefined, productName: "", categoryName: "", expiration: undefined, weight: undefined, picture: "" },
      currentSort:'name',
      currentSortDir:'asc',
      deleteMessage: "",
      index: 0
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

      // async deleteRow(){
      //   let response = await this.deleteRowAsync()
      //   this.groceries = response.data;

      // },

    deleteRow(index: any){
      let url: string = baseUrl +"/"+ index
      axios.delete<void>(url)
      .then((response: AxiosResponse<void>)=>{
        this.deleteMessage = response.status + " " + response.statusText
        this.getAllGroceries()
      })
      .catch((error: AxiosError)=>{
        alert(error.message)
      })
    },
    sort:function(s: any) {
          //if s == current sort, reverse
          if(s === this.currentSort) {
            this.currentSortDir = this.currentSortDir==='asc'?'desc':'asc';
          }
          this.currentSort = s;
        },      
      },
      computed:{
      sortedGroceries:function() {
        return this.groceries.sort((a: any,b: any) => {
          let modifier = 1;
          if(this.currentSortDir === 'desc') modifier = -1;
          if(a[this.currentSort] < b[this.currentSort]) return -1 * modifier;
          if(a[this.currentSort] > b[this.currentSort]) return 1 * modifier;
          return 0;
        });
      }
    }
})