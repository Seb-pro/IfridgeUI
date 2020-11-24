const app = new Vue({
    el:'#app',
    data:{
      cats:[],
      currentSort:'name',
      currentSortDir:'asc'
    },
    created:function() {
      fetch('https://www.raymondcamden.com/.netlify/functions/get-cats')
      .then(res => res.json())
      .then(res => {
        this.cats = res;
      })
    },
    methods:{
      sort:function(s) {
        //if s == current sort, reverse
        if(s === this.currentSort) {
          this.currentSortDir = this.currentSortDir==='asc'?'desc':'asc';
        }
        this.currentSort = s;
      }
    },
    computed:{
      sortedCats:function() {
        return this.cats.sort((a,b) => {
          let modifier = 1;
          if(this.currentSortDir === 'desc') modifier = -1;
          if(a[this.currentSort] < b[this.currentSort]) return -1 * modifier;
          if(a[this.currentSort] > b[this.currentSort]) return 1 * modifier;
          return 0;
        });
      }
    }
  })