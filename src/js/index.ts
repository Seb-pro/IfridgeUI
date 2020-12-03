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
  dateAdded: VarDate,
  expireWarning: boolean,
  daysToExpire: number
}

interface ISub{
    subCategoryId: number,
    categoryId: number,
      category: {
      categoryId: number,
      categoryName: string
      },
    subCategoryName: string,
    isFluid: true
  
}

interface IProduct{
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
}

let baseUrl = 'https://ifridgeapi.azurewebsites.net/api/ProductInstances';

new Vue({
  el: "#app",
  mounted: function(){
    this.getSubCategory()
  },
  data: {
      groceries: [],
      formData: {barcode: undefined, subCategoryId: 0, productName: "", expiration: undefined, weight: undefined, picture: "" },
      currentSort:'name',
      currentSortDir:'asc',
      deleteMessage: "",
      index: 0,
      selectedSubCategory: "",
      subCategories: [],
      products: []

  },

  beforeCreate(){
    this.getSubCategory()
  },

 
  methods: {

    
    async getProductsAsync() {
      let url = "https://ifridgeapi.azurewebsites.net/api/Products"
      try { return axios.get<IProduct[]>(url) }
      catch (error: AxiosError) {
          this.message = error.message;
          alert(error.message)
      }
    },

    async getProducts() {
      let response = await this.getProductsAsync();
      this.products = response.data;
    },

    
    
    setSubCategoryId(Id: number){
      this.formData.subCategoryId = Id;
    },
  
    async getSubCategoriesAsync()
    {
      let url = "https://ifridgeapi.azurewebsites.net/api/SubCategories"
      try { return axios.get<ISub[]>(url) }
      catch (error: AxiosError) {
          this.message = error.message;
          alert(error.message)
      }
    },

    async getSubCategory()
    {
      let response = await this.getSubCategoriesAsync();
      this.subCategories = response.data;
         
    },


    /*
    daysToExpirefunc(){
      this.IGrocery.
    },
    */    
    async add(){
      let url = "https://ifridgeapi.azurewebsites.net/api/Products"
        axios.post<IProduct>(url, this.formData)
    },
    
     async showPic(){
      if (this.groceries.product.experiation <2) {
      
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
        }      
    
  },
      computed:{
      expireWarningFunc:function(){
        if (this.grocery.product.expiration <= 4) {
          return this.grocery.product.expireWarning = true;
        }
        else
        {
          return this.grocery.product.expireWarning = false;
        }
      },
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