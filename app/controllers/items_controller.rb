class ItemsController < ApplicationController
  before_action  :authenticate_user!, only: [:new, :edit, :destroy]
  before_action :set_item, only: [:show, :edit, :update, :destroy, :transaction, :shipped, :recieved, :assess_buyer, :stop_publish, :restart_publish]
  before_action :set_q, only: [:index, :search]
  before_action :remove_image, only: [:destroy]

  def index
    @items = Item.all
    @items = Item.all.page(params[:page]).per(20)
    @categories = Category.all
  end

  def new
    @categories = Category.all
    @parent_category_array = Category.where(ancestry: nil).to_a    
    @item = Item.new    
    @item.images.build
  end

  def get_category_children
    @category_children = Category.find(params[:parent_id]).children
  end
  
  def get_category_grandchildren
    @category_grandchildren = Category.find("#{params[:child_id]}").children
  end

  def create
    @item = Item.new(item_params)
    if params[:pre_published]      
      @item.save(validate: false)
      @item.rooms.create! 
      redirect_to user_pre_published_items_path(@item)
    else      
      if @item.save  
        @item.published!
        @item.rooms.create!
        redirect_to item_path(@item)
      else        
        @parent_category_array = Category.where(ancestry: nil).to_a
        render :new
      end
    end
  
  end
  
  def show   
    @item_category = Category.find(@item.category_id)
    @user_assessments = Assessment.where(trading_partner_id: @item.user_id)
    @room = @item.rooms.first
    @chats = @room.chats
    
    if current_user
      @chat = Chat.new(room_id: @room.id, user_id: current_user.id, item_id: @item.id)
      
      unless current_user.user_rooms.pluck(:room_id).include?(@item.rooms.first.id)
        UserRoom.create(room_id: @room.id, user_id: current_user.id)
      end
    end
    
  end
  
  def edit
    @categories = Category.all
    @parent_category_array = Category.where(ancestry: nil).to_a
    @item_parent_id = Category.find(@item.category_id).parent.parent_id
    @child_category_array = Category.find(@item.category_id).parent.parent.children.to_a
    @item_child_id = Category.find(@item.category_id).parent_id
    @grandchild_category_array = Category.find(@item.category_id).parent.children.to_a
    @item_grandchild_id = @item.category_id
  end
  
  def update
    if params[:item].keys.include?("image") || params[:item].keys.include?("images_attributes")
      if @item.valid?
        if params[:item].keys.include?("image") #保存していた画像があるとき
          update_images_ids = params[:item][:image].values
          before_images_ids = @item.images.ids

          before_images_ids.each do |before_img_id|
            Image.find(before_img_id).destroy unless update_images_ids.include?("#{before_img_id}")             
          end
        else  #保存していた画像が一つもないとき
          before_images_ids = @item.images.ids
          before_images_ids.each do |before_img_id|
            Image.find(before_img_id).destroy
          end
        end
        
        if params[:pre_published]
          if @item.update(item_params)
            @item.pre_published!  
            redirect_to item_path(@item)
          else
            @parent_category_array = Category.where(ancestry: nil).to_a
            render :edit
          end
        else      
          if @item.update(item_params)
            @item.published!  
            redirect_to item_path(@item)
          else
            @parent_category_array = Category.where(ancestry: nil).to_a
            render :edit
          end    
        end
      else
        @parent_category_array = Category.where(ancestry: nil).to_a
        render :edit
      end
    end
  end

  def destroy    
    @item.destroy
    redirect_to user_mypage_path(current_user)
  end
  
  def transaction
    @user_assessments = Assessment.where(trading_partner_id: @item.user_id)
    @buyer = User.find_by(id: @item.buyer_id)
    @seller = User.find_by(id: @item.user_id)

    @room = @item.rooms.last
    if @room.close_chat?
      @chat = Chat.new(room_id: @room.id, user_id: current_user.id, item_id: @item.id)
      @chats = @room.chats
    else
      redirect_to item_path(@item)
    end  

    if @item.shipped? || @item.buyer_assessed?
      @assessment = Assessment.new
    end    
  end
  
  def shipped
    @item.shipped!
    redirect_to transaction_item_path(@item)
  end


  def search
    @results = @q.result
    @items = Item.all
    @categories = Category.all
  end

  def stop_publish
    @item.pre_published!
    redirect_to user_pre_published_items_path(current_user)
  end
  def restart_publish
    @item.published!
    redirect_to user_mypage_path(current_user)
  end


  private
  def item_params
    params.require(:item).permit(:name, :description, :category_id, :price, :prefecture_id, :item_condition_id, :brand_id, :shipping_fee, :shipping_date, :shipping_way_id, images_attributes: [:id, :img]).merge(user_id: current_user.id)
  end
  
  def set_item
    @item = Item.find_by(id: params[:id])
  end

  def chat_params
    params.require(:chat).permit(:message, :user_id, :room_id)
  end

  def set_q
    @q = Item.ransack(params[:q])
  end

  def remove_image
    @item.images.each do |image|
      image.remove_img!
    end
    @item.save(validate: false)
  end
  
end
