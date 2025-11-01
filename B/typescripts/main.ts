import { CookingPotBlock } from "./block/cookingPot/CookingPotBlock";
import { CookingPotBlockEntity } from "./block/cookingPot/CookingPotBlockEntity";
import { CuttingBoardBlock } from "./block/cuttingBoard/CuttingBoardBlock";
import { CuttingBoardBlockEntity } from "./block/cuttingBoard/CuttingBoardBlockEntity";
import { StoveBlock } from "./block/stove/StoveBlock";
import { StoveBlockEntity } from "./block/stove/StoveBlockEntity";
import { Skillet } from "./block/skillet/Skillet";
import { SkilletEntity } from "./block/skillet/SkilletEntity";
import "./item/Knife";
import "./init/CookingPotRecipeRegistry";
import "./init/CuttingBoardRecipeRegistry";
import "./init/CookRecipeRegistry";
import "./item/Food";
import "./customComponents/block/DishComponent"
import { Cabinets } from "./block/cabinet/Cabinets";
import { CabinetsBlockEntity } from "./block/cabinet/CabinetsBlockEntity";
import "./block/RiceBlock";
import { FarmersBook } from "./item/FarmersBook";
import { BlockFood } from "./block/BlockFood";
import { RiceRollMedleyComponentRegister } from "./customComponents/block/RiceRollMedleyComponent";
import { RiceSeedComponentRegister } from "./customComponents/item/RiceSeedComponent";
import { CropComponentRegister } from "./customComponents/block/CropComponent";
import { InteractComponentRegister } from "./customComponents/block/InteractComponent";
import { WildCropComponent } from "./customComponents/block/WildCropComponent";
import { RichSoilComponentRegister } from "./customComponents/block/RichSoilComponent";
import { RichSoilFarmlandComponentRegister } from "./customComponents/block/RichSoilFarmlandComponent";
import { MushroomColonyComonentRegister } from "./customComponents/block/MushroomColonyComonent";
import { ColoniesComonentRegister } from "./customComponents/item/ColoniesComponent";
import { OrganicCompostComonentRegister } from "./customComponents/block/OrganicCompostComonent";
import { RopeComponentRegister } from "./customComponents/block/RopeComponent";
import { TatamMatComponentRegister } from "./customComponents/block/TatamMatComponent";
import { TatamComponentRegister } from "./customComponents/block/TatamiComponent";
import { StoveComponentRegister } from "./customComponents/block/StoveComponent";
import "./item/PartialBlocks";
import { CuttableComponentRegister } from "./customComponents/item/CuttableComponent";
import { CookableComonentRegister } from "./customComponents/item/CookableComponent";
import { CabinetComponentRegister } from "./customComponents/block/CabinetComponent.ts";
import { IncreaseProductionComponentRegister } from "./customComponents/item/IncreaseProductionComponent";
import { SeedComponent } from "./customComponents/item/SeedComponent";
import { PieComponent } from "./customComponents/block/PieCompostComonent";
import { Basket } from "./block/basket/Basket";
import { BasketBlockEntity } from "./block/basket/BasketBlockEntity";
import "./customComponents/item/KnifeComponent"

new CropComponentRegister();
new CabinetComponentRegister();
new WildCropComponent();
new StoveComponentRegister();
new PieComponent();

new RiceRollMedleyComponentRegister();
new InteractComponentRegister();
new RichSoilComponentRegister();
new RichSoilFarmlandComponentRegister();
new MushroomColonyComonentRegister();
new OrganicCompostComonentRegister();
new RopeComponentRegister();
new TatamMatComponentRegister();
new TatamComponentRegister();

new SeedComponent();
new CuttableComponentRegister();
new CookableComonentRegister();
new IncreaseProductionComponentRegister();

new ColoniesComonentRegister();
new RiceSeedComponentRegister();

new CookingPotBlock();
new CookingPotBlockEntity();

new CuttingBoardBlock();
new CuttingBoardBlockEntity();

new StoveBlock();
new StoveBlockEntity();

new Skillet();
new SkilletEntity();

new Cabinets();
new CabinetsBlockEntity();

new Basket();
new BasketBlockEntity();

new FarmersBook();
new BlockFood();
