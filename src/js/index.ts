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
  dateAdded: Date,
  expireWarning: boolean,
  daysToExpire: number
  subCategoryName: string,
  categoryName: string,
  weight: number,
  productName: string
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

interface IRecipeQueryResults{
  results:[{
    sourceUrl: string,
    id: number,
    title: string,
    image: string,
    imageType:string}],
offset: number,
number: number,
totalResults: number
}

interface ingredientsResponse{
  ingredients:[{
      name: string,
      image: string,
      amount:{
          metric:{
              value: number,
              unit: string
          },
          us:{
              value: number,
              unit: string
          }
      }
  }]
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
      recipeQuery: "",
      currentSort:'name',
      currentSortDir:'asc',
      deleteMessage: "",
      index: 0,
      selectedSubCategory: "",
      subCategories: [],
      products: [],
      recipes: []

  },

  beforeCreate(){
    this.getSubCategory()
  },

 
  methods: {

    async getRecipesByQueryAsync(query : string){
      let basisUrl = "https://api.spoonacular.com/recipes/complexSearch?query="
      //OBS på KEY MAX 150Point per dag
      let authentication = "&number=10&apiKey=53229e6b540c401ea70d06a40a272b59&addRecipeInformation=true" // Christians
      //let authentication = "&number=10&apiKey=f41a881d1a3f47ca8de0af384dba58bf&addRecipeInformation=true"  //Majas
      try{ return axios.get<IRecipeQueryResults>(basisUrl + query + authentication)}
      catch (error: AxiosError) {
        this.message = error.message;
        alert(error.message)
      }
    },

    async getRecipesByQuery(query : string){
      let response = await this.getRecipesByQueryAsync(query);
      this.recipes = response.data.results;
    },
    
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

   
    async add(){
      let url = "https://ifridgeapi.azurewebsites.net/api/Products"
        axios.post<IProduct>(url, this.formData)
    },
 

     daysToExpirefunc(list:IGrocery[]){

        let today: Date = new Date;
        list.forEach(function(element) {
          element.expireWarning = true;
          let timeInFridge = today.getTime() - new Date (element.dateAdded).getTime();
          let daysInFridge = timeInFridge / (1000*3600*24);
          element.daysToExpire = element.product.expiration - daysInFridge;
          element.expireWarning = element.daysToExpire < 3;
          //Til sorting
          element.subCategoryName = element.product.subCategory.subCategoryName;
          element.categoryName = element.product.subCategory.category.categoryName;
          element.weight = element.product.weight;
          element.productName = element.product.productName;
        });
        return list;        
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
          this.groceries = this.daysToExpirefunc(response.data);
      },

      clearList() {
          this.groceries = [];
      },     

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