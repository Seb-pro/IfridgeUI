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
    servings: number,
    summary: string,
    vegan: boolean,
    vegetarian: boolean,
    readyInMinutes: number, 
    analyzedInstructions: [{
      name: string,
      steps: [{
        number: number,
        step: string
      }]
    }]
  }]
  offset: number,
  number: number,
  totalResults: number
}

interface IingredientsResponse{
  ingredients:[{
      name: string,
      image: string,
      fontColor: string,
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
      recipes: [],
      missingIngredients: [],
      storedRecipe: null,
      shoppingCart: [],
      formDataShopping: {name: "", amount: undefined},
      //authcode: "53229e6b540c401ea70d06a40a272b59" //Christian
      authcode: "f41a881d1a3f47ca8de0af384dba58bf" //Maja
         
  },

  methods: {

     //henter alle varer i køleskabet
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

    //Sub Kategori
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
     
    setSubCategoryId(Id: number){
      this.formData.subCategoryId = Id;
    },

    //udløbs dato
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

    //angiver hvor mange decimaler der er i days to experation i vores køleskab
    daysToExpireToString(days: number){
      return days.toFixed(1)

    },

    //sletter varer i køleskabet
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
    //ryder den lokale køleskabsliste
    clearList() {
      this.groceries = [];
    },  

    //sorterings funktion
    sort:function(s: any) {
          //if s == current sort, reverse
          if(s === this.currentSort) {
            this.currentSortDir = this.currentSortDir==='asc'?'desc':'asc';
          }
          this.currentSort = s;
    },  
           

    //Opskrift
    async getRecipesByQueryAsync(query : string){
        let basisUrl = "https://api.spoonacular.com/recipes/complexSearch?query="
        //OBS på KEY MAX 150Point per dag
        let authentication = "&number=10&apiKey="+ this.authcode + "&addRecipeInformation=true" // Christians
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

    saveToLocal(recipe : any){
      this.storedRecipe = recipe;
      
    },

    //ingridienser
    async getRecipeById(id: number){
      let urlId = "https://api.spoonacular.com/recipes/"
      let diffrentAuthentication = "/ingredientWidget.json?apiKey=" + this.authcode
      try{ return axios.get<IingredientsResponse>(urlId + id + diffrentAuthentication)}
        catch (error: AxiosError) {
        this.message = error.message;
        alert(error.message)
      }
    },

    async BuyIngredient(recipe: any){
     //her henter vi ingridienser for opskriften basseret på Id
     let response1 = await this.getRecipeById(recipe.id);
     let internalList  = response1.data.ingredients;
     //her henter vi vores liste af varer vi har i køleskabet
     let response2 = await this.getAllGroceriesAsync();
     let grocerie = response2.data;
      //lav en ny liste hvor vi gemmer nye elementer og gennemløber listen af ingridenser her gennem vi elementet hvis det passer på den næste foreach
      internalList.forEach(function(element: any) {
        //vi har fat i listen af varer i køleskabet og ønsker at finde varer med subcategori der matcher ingridens navnet
          grocerie.forEach(function(grocery: any){
          // hvis der ikke er et match ændres tekst farven fra hvid til rød ellers er den bare hvid
          if(element.name.toLowerCase().includes(grocery.product.subCategory.subCategoryName.toLowerCase())) {
            element.fontColor = "000000"
          } else {
            if(element.fontColor != "000000"){
              element.fontColor = "FF0000"
            }           
          }
       });
      });
      //her sætter vi vores liste med elementer = med manglende varer listen vi bruger i html'en 
      this.missingIngredients = internalList
      this.storedRecipe = recipe;
    }, 
   
    
    //Tilføj varer type til DB
    async add(){
      let url = "https://ifridgeapi.azurewebsites.net/api/Products"
        axios.post<IProduct>(url, this.formData)
    },
    
    addToShopping(){
      let newGrocery: any = {name: this.formDataShopping.name, amount: this.formDataShopping.amount}
      this.shoppingCart.push(newGrocery)
    },
      
    
    sendToShoppingList(){
     let list: any = this.shoppingCart 
      this.missingIngredients.forEach(function(element : any){
        if(element.fontColor == "FF0000"){
        let shoppingItem: any = {
          name: element.name, 
          amount: element.amount.metric.value, 
          isInCart: false
          }          
         list.push(shoppingItem)
        }          
      })
      this.shoppingCart = list
    },
       
  //Henter varer fra DB
   /* async getProductsAsync() {
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
    },*/
    
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