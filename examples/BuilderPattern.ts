class Pizza {
  private size: string;
  private cheese: boolean;
  private pepperoni: boolean;
  private bacon: boolean;

  constructor(builder: PizzaBuilder) {
      this.size = builder.size;
      this.cheese = builder.cheese || false;
      this.pepperoni = builder.pepperoni || false;
      this.bacon = builder.bacon || false;
  }
}

class PizzaBuilder {
  public size: string;
  public cheese: boolean;
  public pepperoni: boolean;
  public bacon: boolean;

  constructor(size: string) {
      this.size = size;
  }

  addCheese() {
      this.cheese = true;
      return this;
  }

  addPepperoni() {
      this.pepperoni = true;
      return this;
  }

  addBacon() {
      this.bacon = true;
      return this;
  }

  build() {
      return new Pizza(this);
  }
}

const pizza = new PizzaBuilder('Large')
  .addCheese()
  .addPepperoni()
  .build();