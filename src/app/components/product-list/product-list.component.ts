import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  currentCategoryId: number = 1;
  searchMode: boolean = false;
  previousCategoryId: number = 1;

  //new proprities for pagination
  thePageNumber: number = 1;
  thePageSize: number = 50;
  theTotalElemnts: number = 0;

  constructor(
    private productSevice: ProductService,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }
  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('Keyword');
    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }
  }
  handleSearchProducts() {
    const theKeyword: string = this.route.snapshot.paramMap.get('Keyword')!;
    //search for products using keywords
    this.productSevice
      .searchProducts(theKeyword)
      .subscribe((data: Product[]) => {
        this.products = data;
      });
  }

  handleListProducts() {
    //check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');
    if (hasCategoryId) {
      //get the "id" param string .convert string to a number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    } else {
      //not category id available ... default to category id 1
      this.currentCategoryId = 1;
    }
    //
    //
    //check if we have a differnet category than previous
    //Note: Angular will reuse a component if it is currently being viewed
    //
    //if we have a different category id than previous
    //then set thePageNumber back to 1
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;
    console.log(
      `currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`
    );
    // now get the products for the given category

    this.productSevice
      .getProductListPaginate(
        this.thePageNumber - 1,
        this.thePageSize,
        this.currentCategoryId
      )
      .subscribe((data: any) => {
        this.products = data._embedded.products;
        this.thePageNumber = data.page ? data.page.number + 1 : 1;
        this.thePageSize = data.page ? data.page.size : 0;
        this.theTotalElemnts = data.page ? data.page.totalElements : 0;
        //this code is the original
        //this.products =data._embdded.products
        //this.thePageNumber = data.page.number+1
        //this.thePageSize =data.page.size;
        //this.theTotalElements = data.page.totalElemnts;
      });
  }
}
